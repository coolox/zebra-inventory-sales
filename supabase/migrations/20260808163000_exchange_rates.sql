-- Zebra Retail · Owner-managed daily exchange rates.
-- Apply after 20260808160000_inventory_receipts.sql.

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

  insert into public.exchange_rates (business_date, currency, eur_rate, entered_by)
  values (p_business_date, p_currency, p_eur_rate, v_actor_id)
  on conflict (business_date, currency) do update
  set eur_rate = excluded.eur_rate,
      entered_by = excluded.entered_by,
      created_at = now()
  returning * into v_rate;

  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (
    v_store_id,
    v_actor_id,
    'exchange_rate.upserted',
    'exchange_rate',
    v_rate.id,
    jsonb_build_object('business_date', p_business_date, 'currency', p_currency, 'eur_rate', p_eur_rate)
  );

  return v_rate;
end;
$$;

revoke all on function public.upsert_exchange_rate(date, public.currency_code, numeric) from public;
grant execute on function public.upsert_exchange_rate(date, public.currency_code, numeric) to authenticated;
