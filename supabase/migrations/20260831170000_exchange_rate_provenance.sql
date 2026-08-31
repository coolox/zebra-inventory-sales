-- Zebra Retail · FX provenance before automatic TCMB sync.
-- Existing rows remain Owner-entered manual overrides; financial snapshots are untouched.

create type public.exchange_rate_status as enum ('automatic', 'carried_forward', 'manual_override');

alter table public.exchange_rates
  add column provider text,
  add column rate_basis text,
  add column source_rate_date date,
  add column fetched_at timestamptz,
  add column status public.exchange_rate_status,
  add column carried_from_business_date date;

update public.exchange_rates
set
  provider = 'manual',
  rate_basis = 'owner_manual',
  source_rate_date = business_date,
  fetched_at = created_at,
  status = 'manual_override';

alter table public.exchange_rates
  alter column provider set not null,
  alter column provider set default 'manual',
  alter column rate_basis set not null,
  alter column rate_basis set default 'owner_manual',
  alter column source_rate_date set not null,
  alter column fetched_at set not null,
  alter column fetched_at set default now(),
  alter column status set not null,
  alter column status set default 'manual_override',
  alter column entered_by drop not null,
  add constraint exchange_rates_provider_check check (provider in ('manual', 'TCMB')),
  add constraint exchange_rates_rate_basis_check check (rate_basis in ('owner_manual', 'forex_selling')),
  add constraint exchange_rates_source_rate_date_check check (source_rate_date <= business_date),
  add constraint exchange_rates_provenance_check check (
    (status = 'manual_override' and provider = 'manual' and rate_basis = 'owner_manual' and entered_by is not null and carried_from_business_date is null)
    or
    (status = 'automatic' and provider = 'TCMB' and rate_basis = 'forex_selling' and carried_from_business_date is null)
    or
    (status = 'carried_forward' and provider = 'TCMB' and rate_basis = 'forex_selling' and carried_from_business_date is not null and carried_from_business_date < business_date)
  );

-- Keep controlled SQL fixtures and any pre-existing internal writer compatible
-- with the former four-column manual contract. Public writes remain RPC-only.
create or replace function public.apply_exchange_rate_manual_defaults()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.source_rate_date is null then
    new.source_rate_date := new.business_date;
  end if;
  if new.fetched_at is null then
    new.fetched_at := now();
  end if;
  return new;
end;
$$;

create trigger exchange_rates_apply_manual_defaults
before insert on public.exchange_rates
for each row execute function public.apply_exchange_rate_manual_defaults();

create or replace function public.upsert_exchange_rate(
  p_business_date date,
  p_currency public.currency_code,
  p_eur_rate numeric(18, 8)
)
returns public.exchange_rates language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_store_id uuid;
  v_rate public.exchange_rates;
begin
  if v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  select store_id into v_store_id
  from public.store_memberships
  where user_id = v_actor_id and status = 'active' and role = 'owner'
  order by created_at
  limit 1;

  if v_store_id is null then
    raise exception 'Only an Owner can set exchange rates';
  end if;

  if p_business_date is null or p_currency is null or p_eur_rate is null or p_eur_rate <= 0 then
    raise exception 'Business date, currency and a positive EUR rate are required';
  end if;

  if p_currency = 'EUR' and p_eur_rate <> 1 then
    raise exception 'EUR rate must be 1';
  end if;

  insert into public.exchange_rates (
    business_date, currency, eur_rate, entered_by, provider, rate_basis,
    source_rate_date, fetched_at, status, carried_from_business_date
  )
  values (
    p_business_date, p_currency, p_eur_rate, v_actor_id, 'manual', 'owner_manual',
    p_business_date, now(), 'manual_override', null
  )
  on conflict (business_date, currency) do update
  set eur_rate = excluded.eur_rate,
      entered_by = excluded.entered_by,
      provider = excluded.provider,
      rate_basis = excluded.rate_basis,
      source_rate_date = excluded.source_rate_date,
      fetched_at = excluded.fetched_at,
      status = excluded.status,
      carried_from_business_date = excluded.carried_from_business_date,
      created_at = now()
  returning * into v_rate;

  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (
    v_store_id,
    v_actor_id,
    'exchange_rate.upserted',
    'exchange_rate',
    v_rate.id,
    jsonb_build_object(
      'business_date', p_business_date,
      'currency', p_currency,
      'eur_rate', p_eur_rate,
      'provider', v_rate.provider,
      'rate_basis', v_rate.rate_basis,
      'source_rate_date', v_rate.source_rate_date,
      'status', v_rate.status
    )
  );

  return v_rate;
end;
$$;

revoke all on function public.upsert_exchange_rate(date, public.currency_code, numeric) from public;
grant execute on function public.upsert_exchange_rate(date, public.currency_code, numeric) to authenticated;
