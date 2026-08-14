-- Zebra Retail · Seller-facing store and personal sales aggregates.
-- This RPC deliberately has no seller-id parameter: personal totals always use auth.uid().

create or replace function public.get_seller_sales_summary(
  p_store_id uuid,
  p_now timestamptz default now()
)
returns table (
  summary_key text,
  revenue_eur numeric(14,2),
  units bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_timezone text;
  v_today date;
  v_week_start date;
  v_month_start date;
  v_year_start date;
begin
  if v_actor_id is null or not public.user_has_store_access(p_store_id) then
    raise exception 'No access to this store';
  end if;
  if p_now is null then
    raise exception 'A summary timestamp is required';
  end if;

  select store.timezone into v_timezone from public.stores store where store.id = p_store_id;
  if v_timezone is null then
    raise exception 'Store timezone is unavailable';
  end if;

  v_today := (p_now at time zone v_timezone)::date;
  -- PostgreSQL DOW is Sunday=0; Wednesday is the first day of Zebra's business week.
  v_week_start := v_today - ((extract(dow from v_today)::integer + 4) % 7);
  v_month_start := date_trunc('month', v_today)::date;
  v_year_start := date_trunc('year', v_today)::date;

  return query
  with periods(summary_key, own_sales_only, date_from, date_to) as (
    values
      ('store_today'::text, false, v_today, v_today),
      ('store_week'::text, false, v_week_start, v_week_start + 6),
      ('personal_today'::text, true, v_today, v_today),
      ('personal_week'::text, true, v_week_start, v_week_start + 6),
      ('personal_month'::text, true, v_month_start, v_today),
      ('personal_year'::text, true, v_year_start, v_today),
      ('personal_all_time'::text, true, null::date, null::date)
  ), confirmed_sales as (
    select sale.id, sale.seller_id, sale.total_amount_eur,
      (sale.sold_at at time zone v_timezone)::date as business_date
    from public.sales sale
    where sale.store_id = p_store_id and sale.status = 'confirmed'
  ), sale_units as (
    select line.sale_id, coalesce(sum(line.quantity), 0)::bigint as units
    from public.sale_lines line
    join confirmed_sales sale on sale.id = line.sale_id
    group by line.sale_id
  ), exchange_top_ups as (
    select source_sale.seller_id, exchange.top_up_eur,
      (exchange.exchanged_at at time zone v_timezone)::date as business_date
    from public.sale_exchanges exchange
    join public.sale_lines source_line on source_line.id = exchange.source_sale_line_id
    join confirmed_sales source_sale on source_sale.id = source_line.sale_id
    where exchange.store_id = p_store_id
  )
  select
    period.summary_key,
    round(
      coalesce((
        select sum(sale.total_amount_eur)
        from confirmed_sales sale
        where (not period.own_sales_only or sale.seller_id = v_actor_id)
          and (period.date_from is null or sale.business_date between period.date_from and period.date_to)
      ), 0) + coalesce((
        select sum(exchange.top_up_eur)
        from exchange_top_ups exchange
        where (not period.own_sales_only or exchange.seller_id = v_actor_id)
          and (period.date_from is null or exchange.business_date between period.date_from and period.date_to)
      ), 0),
      2
    )::numeric(14,2),
    coalesce((
      select sum(units.units)
      from confirmed_sales sale
      join sale_units units on units.sale_id = sale.id
      where (not period.own_sales_only or sale.seller_id = v_actor_id)
        and (period.date_from is null or sale.business_date between period.date_from and period.date_to)
    ), 0)::bigint
  from periods period;
end;
$$;

revoke all on function public.get_seller_sales_summary(uuid, timestamptz) from public;
grant execute on function public.get_seller_sales_summary(uuid, timestamptz) to authenticated;

-- Rollback outline: revoke execute and drop this read-only function. Financial
-- snapshots and RLS policies are unchanged.
