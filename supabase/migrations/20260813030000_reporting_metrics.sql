-- Zebra Retail · store-scoped financial reporting from immutable EUR snapshots.
-- An exchange is not a second sale: only its positive top-up contributes revenue.

create or replace function public.get_reporting_metrics(p_store_id uuid, p_from date, p_to date)
returns table (
  revenue_eur numeric(14,2),
  cost_eur numeric(14,2),
  margin_eur numeric(14,2),
  sale_count bigint,
  units bigint,
  average_ticket_eur numeric(14,2)
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not public.user_has_store_access(p_store_id) then
    raise exception 'No access to this store';
  end if;
  if p_from is null or p_to is null or p_from > p_to then
    raise exception 'A valid report date range is required';
  end if;

  return query
  with confirmed_sales as (
    select sale.id, sale.total_amount_eur
    from public.sales sale
    where sale.store_id = p_store_id
      and sale.status = 'confirmed'
      and (sale.sold_at at time zone (select timezone from public.stores where id = p_store_id))::date between p_from and p_to
  ), sale_totals as (
    select
      coalesce(sum(sale.total_amount_eur), 0)::numeric(14,2) as revenue_eur,
      coalesce(sum(line.unit_cost_eur * line.quantity), 0)::numeric(14,2) as cost_eur,
      count(distinct sale.id)::bigint as sale_count,
      coalesce(sum(line.quantity), 0)::bigint as units
    from confirmed_sales sale
    left join public.sale_lines line on line.sale_id = sale.id
  ), exchange_top_ups as (
    select coalesce(sum(exchange.top_up_eur), 0)::numeric(14,2) as revenue_eur
    from public.sale_exchanges exchange
    join public.sale_lines source_line on source_line.id = exchange.source_sale_line_id
    join confirmed_sales source_sale on source_sale.id = source_line.sale_id
    where exchange.store_id = p_store_id
      and (exchange.exchanged_at at time zone (select timezone from public.stores where id = p_store_id))::date between p_from and p_to
  )
  select
    round(sale_totals.revenue_eur + exchange_top_ups.revenue_eur, 2),
    round(sale_totals.cost_eur, 2),
    round(sale_totals.revenue_eur + exchange_top_ups.revenue_eur - sale_totals.cost_eur, 2),
    sale_totals.sale_count,
    sale_totals.units,
    case when sale_totals.sale_count = 0 then 0::numeric(14,2)
      else round((sale_totals.revenue_eur + exchange_top_ups.revenue_eur) / sale_totals.sale_count, 2)
    end
  from sale_totals cross join exchange_top_ups;
end;
$$;

revoke all on function public.get_reporting_metrics(uuid, date, date) from public;
grant execute on function public.get_reporting_metrics(uuid, date, date) to authenticated;

-- Rollback outline: revoke execute and drop this read-only function. No financial
-- snapshots are changed or deleted by this migration.
