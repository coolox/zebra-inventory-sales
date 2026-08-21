-- Zebra Retail · TASK-182. Owner reports may show approved email only when a
-- same-store actor has no display name; Seller callers retain the safe unknown label.

create or replace function public.get_reporting_breakdown(p_store_id uuid, p_from date, p_to date, p_dimension text)
returns table (dimension_key text, dimension_label text, revenue_eur numeric(14,2), cost_eur numeric(14,2), margin_eur numeric(14,2), units bigint)
language plpgsql security definer set search_path = '' as $$
declare v_owner boolean := public.user_is_store_owner(p_store_id);
begin
  if (select auth.uid()) is null or not public.user_has_store_access(p_store_id) then raise exception 'No access to this store'; end if;
  if p_from is null or p_to is null or p_from > p_to then raise exception 'A valid report date range is required'; end if;
  if p_dimension not in ('seller', 'supplier', 'brand', 'model', 'category') then raise exception 'Unknown reporting dimension'; end if;
  return query with store_context as (select timezone from public.stores where id = p_store_id),
  confirmed_lines as (
    select sale.id sale_id, sale.seller_id, sale.pricing_mode, sale.total_amount_eur, line.id line_id, line.quantity, line.unit_price_eur, line.unit_cost_eur,
      model.id model_id, model.supplier_id, model.brand, model.model_code, model.name model_name, model.category,
      profile.full_name seller_name, actor.email::text seller_email, supplier.name::text supplier_name,
      sum(line.unit_cost_eur * line.quantity) over (partition by sale.id) sale_cost_eur
    from public.sales sale join public.sale_lines line on line.sale_id = sale.id join public.product_variants variant on variant.id = line.variant_id
    join public.product_models model on model.id = variant.product_model_id left join public.profiles profile on profile.id = sale.seller_id
    left join auth.users actor on actor.id = sale.seller_id left join public.suppliers supplier on supplier.id = model.supplier_id cross join store_context store
    where sale.store_id = p_store_id and sale.status = 'confirmed' and (sale.sold_at at time zone store.timezone)::date between p_from and p_to
  ), sale_financials as (
    select *, case when pricing_mode = 'per_item' then unit_price_eur * quantity when sale_cost_eur > 0 then total_amount_eur * (unit_cost_eur * quantity) / sale_cost_eur else total_amount_eur / count(*) over (partition by sale_id) end revenue from confirmed_lines
  ), exchange_financials as (
    select source_sale.seller_id, source_line.variant_id, exchange.top_up_eur revenue from public.sale_exchanges exchange join public.sale_lines source_line on source_line.id = exchange.source_sale_line_id join public.sales source_sale on source_sale.id = source_line.sale_id and source_sale.status = 'confirmed' cross join store_context store where exchange.store_id = p_store_id and (exchange.exchanged_at at time zone store.timezone)::date between p_from and p_to
  ), contributions as (
    select seller_id, seller_name, seller_email, supplier_id, supplier_name, brand, model_id, model_code, model_name, category, revenue, unit_cost_eur * quantity cost, quantity::bigint units from sale_financials
    union all
    select exchange.seller_id, profile.full_name, actor.email::text, model.supplier_id, supplier.name::text, model.brand, model.id, model.model_code, model.name, model.category, exchange.revenue, 0::numeric, 0::bigint
    from exchange_financials exchange join public.product_variants variant on variant.id = exchange.variant_id join public.product_models model on model.id = variant.product_model_id left join public.profiles profile on profile.id = exchange.seller_id left join auth.users actor on actor.id = exchange.seller_id left join public.suppliers supplier on supplier.id = model.supplier_id
  ), dimensioned as (
    select case p_dimension when 'seller' then seller_id::text when 'supplier' then coalesce(supplier_id::text, 'unassigned') when 'brand' then brand when 'model' then model_id::text when 'category' then category end dimension_key,
      case p_dimension when 'seller' then coalesce(nullif(seller_name, ''), case when v_owner then nullif(seller_email, '') end, 'Unknown seller') when 'supplier' then coalesce(supplier_name, 'Unassigned supplier') when 'brand' then brand when 'model' then model_code || ' · ' || model_name when 'category' then category end dimension_label,
      contributions.revenue, contributions.cost, contributions.units from contributions
  ) select dimensioned.dimension_key, dimensioned.dimension_label, round(sum(dimensioned.revenue), 2), round(sum(dimensioned.cost), 2), round(sum(dimensioned.revenue) - sum(dimensioned.cost), 2), sum(dimensioned.units)::bigint from dimensioned group by dimensioned.dimension_key, dimensioned.dimension_label order by revenue_eur desc, dimension_label;
end;
$$;
revoke all on function public.get_reporting_breakdown(uuid, date, date, text) from public;
grant execute on function public.get_reporting_breakdown(uuid, date, date, text) to authenticated;
