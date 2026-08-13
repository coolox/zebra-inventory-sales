-- Zebra Retail · ledger-derived inventory reporting as of an Istanbul business date.

create or replace function public.get_inventory_report(p_store_id uuid, p_from date, p_to date)
returns table (
  model_id uuid,
  model_code text,
  model_name text,
  variant_id uuid,
  color text,
  size text,
  balance integer,
  sold_units bigint,
  sell_through numeric(14,4),
  turnover numeric(14,4),
  low_stock_threshold integer,
  is_low_stock boolean
)
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not public.user_has_store_access(p_store_id) then raise exception 'No access to this store'; end if;
  if p_from is null or p_to is null or p_from > p_to then raise exception 'A valid report date range is required'; end if;

  return query
  with store_context as (select timezone from public.stores where id = p_store_id), variants as (
    select model.id as model_id, model.model_code, model.name as model_name, variant.id as variant_id, variant.color, variant.size,
      coalesce(model.low_stock_threshold, policy.low_stock_threshold, 2) as threshold
    from public.product_variants variant
    join public.product_models model on model.id = variant.product_model_id
    left join public.store_inventory_policies policy on policy.store_id = p_store_id
    where model.store_id = p_store_id
  ), balances as (
    select movement.variant_id,
      coalesce(sum(movement.quantity) filter (where (movement.occurred_at at time zone store.timezone)::date <= p_to), 0)::integer as closing_balance,
      coalesce(sum(movement.quantity) filter (where (movement.occurred_at at time zone store.timezone)::date < p_from), 0)::integer as opening_balance
    from public.inventory_movements movement cross join store_context store
    where movement.store_id = p_store_id
    group by movement.variant_id
  ), sold as (
    select line.variant_id, coalesce(sum(line.quantity), 0)::bigint as units
    from public.sales sale
    join public.sale_lines line on line.sale_id = sale.id
    cross join store_context store
    where sale.store_id = p_store_id and sale.status = 'confirmed'
      and (sale.sold_at at time zone store.timezone)::date between p_from and p_to
    group by line.variant_id
  )
  select variant.model_id, variant.model_code, variant.model_name, variant.variant_id, variant.color, variant.size,
    coalesce(balance.closing_balance, 0), coalesce(sold.units, 0),
    case when coalesce(sold.units, 0) + greatest(coalesce(balance.closing_balance, 0), 0) = 0 then 0::numeric
      else round(sold.units::numeric / (sold.units + greatest(balance.closing_balance, 0)), 4) end,
    case when (coalesce(balance.opening_balance, 0) + coalesce(balance.closing_balance, 0)) = 0 then 0::numeric
      else round(sold.units::numeric / ((coalesce(balance.opening_balance, 0) + coalesce(balance.closing_balance, 0)) / 2.0), 4) end,
    variant.threshold, coalesce(balance.closing_balance, 0) <= variant.threshold
  from variants variant
  left join balances balance on balance.variant_id = variant.variant_id
  left join sold on sold.variant_id = variant.variant_id
  order by is_low_stock desc, variant.model_code, variant.color, variant.size;
end;
$$;

revoke all on function public.get_inventory_report(uuid, date, date) from public;
grant execute on function public.get_inventory_report(uuid, date, date) to authenticated;
