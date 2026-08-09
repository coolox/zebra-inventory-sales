-- Zebra Retail · attach a payment record to an atomic sale.
-- Apply after 20260809020000_sales_foundation.sql.

create or replace function public.confirm_sale_with_payment(
  p_store_id uuid,
  p_lines jsonb,
  p_payment_method public.payment_method,
  p_idempotency_key uuid,
  p_sold_at timestamptz default now()
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_result jsonb;
  v_sale_id uuid;
  v_total_eur numeric(14,2);
begin
  if p_payment_method is null then raise exception 'Payment method is required'; end if;
  v_result := public.confirm_sale(p_store_id, p_lines, p_idempotency_key, p_sold_at);
  v_sale_id := (v_result ->> 'sale_id')::uuid;
  if (v_result ->> 'idempotent_replay')::boolean then return v_result; end if;
  select round(sum(unit_price_eur * quantity), 2)
  into v_total_eur from public.sale_lines where sale_id = v_sale_id;
  insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur)
  values (v_sale_id, p_payment_method, v_total_eur, 'EUR', 1, v_total_eur);
  return v_result;
end;
$$;
revoke all on function public.confirm_sale_with_payment(uuid, jsonb, public.payment_method, uuid, timestamptz) from public;
grant execute on function public.confirm_sale_with_payment(uuid, jsonb, public.payment_method, uuid, timestamptz) to authenticated;
