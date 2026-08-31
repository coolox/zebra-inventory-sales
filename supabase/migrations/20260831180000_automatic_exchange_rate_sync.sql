-- Zebra Retail · server-only automatic TCMB rate application and observable sync health.

create type public.exchange_rate_sync_outcome as enum ('success', 'carried_forward', 'failed');

create table public.exchange_rate_sync_runs (
  business_date date primary key,
  outcome public.exchange_rate_sync_outcome not null,
  source_rate_date date,
  attempted_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_rate_count integer not null default 0 check (updated_rate_count >= 0),
  error_code text,
  error_message text,
  check (
    (outcome in ('success', 'carried_forward') and source_rate_date is not null and completed_at is not null and error_code is null and error_message is null)
    or
    (outcome = 'failed' and source_rate_date is null and completed_at is null and error_code is not null and error_message is not null)
  )
);

grant select on public.exchange_rate_sync_runs to authenticated;
alter table public.exchange_rate_sync_runs enable row level security;
create policy "exchange rate sync: owner read" on public.exchange_rate_sync_runs for select to authenticated using (
  exists (
    select 1 from public.store_memberships membership
    where membership.user_id = (select auth.uid())
      and membership.role = 'owner'
      and membership.status = 'active'
  )
);

create or replace function public.apply_automatic_exchange_rates(
  p_business_date date,
  p_source_rate_date date,
  p_rates jsonb,
  p_status public.exchange_rate_status,
  p_carried_from_business_date date default null,
  p_fetched_at timestamptz default now()
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_currency public.currency_code;
  v_rate numeric(18, 8);
  v_updated_count integer := 0;
  v_rows_written integer;
  v_expected_outcome public.exchange_rate_sync_outcome;
begin
  if p_business_date is null or p_source_rate_date is null or p_fetched_at is null
    or p_status not in ('automatic', 'carried_forward') then
    raise exception 'Automatic FX sync requires business date, source date, fetched time and automatic status';
  end if;

  if p_source_rate_date > p_business_date then
    raise exception 'FX source date cannot be after business date';
  end if;

  if jsonb_typeof(p_rates) <> 'array' or jsonb_array_length(p_rates) <> 3 then
    raise exception 'Automatic FX sync requires exactly EUR, USD and TRY rates';
  end if;

  if p_status = 'automatic' and (p_source_rate_date <> p_business_date or p_carried_from_business_date is not null) then
    raise exception 'Automatic FX rate must originate on its business date';
  end if;

  if p_status = 'carried_forward' and (p_carried_from_business_date is null or p_carried_from_business_date >= p_business_date) then
    raise exception 'Carried FX rate requires an earlier carried-from business date';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_rates) as rate(currency text, eur_rate numeric)
    where rate.currency not in ('EUR', 'USD', 'TRY') or rate.eur_rate is null or rate.eur_rate <= 0
  ) or (select count(distinct rate.currency) from jsonb_to_recordset(p_rates) as rate(currency text, eur_rate numeric)) <> 3
    or not exists (select 1 from jsonb_to_recordset(p_rates) as rate(currency text, eur_rate numeric) where rate.currency = 'EUR' and rate.eur_rate = 1) then
    raise exception 'Automatic FX rates must contain positive EUR=1, USD and TRY values';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('automatic-exchange-rates:' || p_business_date::text, 0));

  for v_currency, v_rate in
    select rate.currency::public.currency_code, rate.eur_rate::numeric(18, 8)
    from jsonb_to_recordset(p_rates) as rate(currency text, eur_rate numeric)
  loop
    insert into public.exchange_rates (
      business_date, currency, eur_rate, entered_by, provider, rate_basis,
      source_rate_date, fetched_at, status, carried_from_business_date
    ) values (
      p_business_date, v_currency, v_rate, null, 'TCMB', 'forex_selling',
      p_source_rate_date, p_fetched_at, p_status, p_carried_from_business_date
    )
    on conflict (business_date, currency) do update
    set eur_rate = excluded.eur_rate,
        entered_by = null,
        provider = excluded.provider,
        rate_basis = excluded.rate_basis,
        source_rate_date = excluded.source_rate_date,
        fetched_at = excluded.fetched_at,
        status = excluded.status,
        carried_from_business_date = excluded.carried_from_business_date
    where public.exchange_rates.status <> 'manual_override'
      and (
        public.exchange_rates.eur_rate,
        public.exchange_rates.provider,
        public.exchange_rates.rate_basis,
        public.exchange_rates.source_rate_date,
        public.exchange_rates.status,
        public.exchange_rates.carried_from_business_date
      ) is distinct from (
        excluded.eur_rate,
        excluded.provider,
        excluded.rate_basis,
        excluded.source_rate_date,
        excluded.status,
        excluded.carried_from_business_date
      );
    get diagnostics v_rows_written = row_count;
    v_updated_count := v_updated_count + v_rows_written;
  end loop;

  v_expected_outcome := case when p_status = 'automatic' then 'success' else 'carried_forward' end;
  insert into public.exchange_rate_sync_runs (business_date, outcome, source_rate_date, attempted_at, completed_at, updated_rate_count, error_code, error_message)
  values (p_business_date, v_expected_outcome, p_source_rate_date, p_fetched_at, p_fetched_at, v_updated_count, null, null)
  on conflict (business_date) do update
  set outcome = excluded.outcome,
      source_rate_date = excluded.source_rate_date,
      attempted_at = excluded.attempted_at,
      completed_at = excluded.completed_at,
      updated_rate_count = excluded.updated_rate_count,
      error_code = null,
      error_message = null;

  return jsonb_build_object('updated_rate_count', v_updated_count, 'outcome', v_expected_outcome);
end;
$$;

revoke all on function public.apply_automatic_exchange_rates(date, date, jsonb, public.exchange_rate_status, date, timestamptz) from public;
grant execute on function public.apply_automatic_exchange_rates(date, date, jsonb, public.exchange_rate_status, date, timestamptz) to service_role;
