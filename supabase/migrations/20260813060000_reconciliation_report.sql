-- Zebra Retail · read-only Owner reconciliation over immutable sales/payment and inventory ledgers.
create or replace function public.get_reconciliation_discrepancies(p_store_id uuid)
returns table (
  discrepancy_type text,
  severity text,
  source_ids jsonb,
  expected_value numeric(14,2),
  actual_value numeric(14,2),
  occurred_at timestamptz,
  summary text
)
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not public.user_is_store_owner(p_store_id) then
    raise exception 'Owner access is required for reconciliation';
  end if;

  return query
  with payment_mismatches as (
    select sale.id as sale_id, sale.sold_at, sale.total_amount_eur as expected_value,
      coalesce(sum(payment.amount_eur) filter (where payment.status = 'captured'), 0)::numeric(14,2) as actual_value,
      coalesce(jsonb_agg(payment.id) filter (where payment.id is not null), '[]'::jsonb) as payment_ids
    from public.sales sale
    left join public.sale_payments payment on payment.sale_id = sale.id
    where sale.store_id = p_store_id and sale.status = 'confirmed'
    group by sale.id, sale.sold_at, sale.total_amount_eur
    having abs(sale.total_amount_eur - coalesce(sum(payment.amount_eur) filter (where payment.status = 'captured'), 0)) > 0.01
  ), missing_sale_movements as (
    select sale.id as sale_id, line.id as sale_line_id, line.variant_id, sale.sold_at, line.quantity
    from public.sales sale
    join public.sale_lines line on line.sale_id = sale.id
    where sale.store_id = p_store_id and sale.status = 'confirmed'
      and not exists (
        select 1 from public.inventory_movements movement
        where movement.store_id = p_store_id and movement.variant_id = line.variant_id
          and movement.movement_type = 'sale' and movement.quantity = -line.quantity
          and movement.occurred_at = sale.sold_at
      )
  ), negative_balances as (
    select movement.variant_id, min(movement.occurred_at) as occurred_at, sum(movement.quantity)::numeric(14,2) as balance,
      jsonb_agg(movement.id order by movement.occurred_at) as movement_ids
    from public.inventory_movements movement
    where movement.store_id = p_store_id
    group by movement.variant_id
    having sum(movement.quantity) < 0
  ), manual_corrections as (
    select movement.id as movement_id, movement.variant_id, movement.occurred_at, movement.quantity::numeric(14,2) as quantity
    from public.inventory_movements movement
    where movement.store_id = p_store_id and movement.movement_type = 'adjustment'
  )
  select 'payment_mismatch', 'error', jsonb_build_object('sale_id', payment.sale_id, 'payment_ids', payment.payment_ids), payment.expected_value, payment.actual_value, payment.sold_at,
    'Captured payments do not equal the confirmed sale EUR total'
  from payment_mismatches payment
  union all
  select 'missing_sale_movement', 'error', jsonb_build_object('sale_id', movement.sale_id, 'sale_line_id', movement.sale_line_id, 'variant_id', movement.variant_id), movement.quantity::numeric(14,2), 0::numeric(14,2), movement.sold_at,
    'Confirmed sale line has no matching stock movement'
  from missing_sale_movements movement
  union all
  select 'negative_balance', 'error', jsonb_build_object('variant_id', balance.variant_id, 'movement_ids', balance.movement_ids), 0::numeric(14,2), balance.balance, balance.occurred_at,
    'Inventory ledger balance is negative'
  from negative_balances balance
  union all
  select 'manual_correction', 'review', jsonb_build_object('movement_id', correction.movement_id, 'variant_id', correction.variant_id), null::numeric(14,2), correction.quantity, correction.occurred_at,
    'Manual inventory correction requires Owner review'
  from manual_corrections correction
  order by 6 desc nulls last, 1;
end;
$$;

revoke all on function public.get_reconciliation_discrepancies(uuid) from public;
grant execute on function public.get_reconciliation_discrepancies(uuid) to authenticated;

-- Rollback outline: revoke execute and drop this read-only reporting function.
