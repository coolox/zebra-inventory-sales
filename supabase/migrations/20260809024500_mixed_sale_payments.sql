-- Zebra Retail · mixed payments in EUR base reporting currency.
-- Apply after 20260809023000_sale_payments.sql.

create or replace function public.confirm_sale_with_payments(
  p_store_id uuid,
  p_lines jsonb,
  p_payments jsonb,
  p_idempotency_key uuid,
  p_sold_at timestamptz default now()
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_result jsonb;
  v_sale_id uuid;
  v_total_eur numeric(14,2);
  v_payment jsonb;
  v_paid_eur numeric(14,2) := 0;
  v_method public.payment_method;
  v_amount numeric(14,2);
begin
  if jsonb_typeof(p_payments) <> 'array' or jsonb_array_length(p_payments) = 0 then raise exception 'At least one payment is required'; end if;
  v_result := public.confirm_sale(p_store_id, p_lines, p_idempotency_key, p_sold_at);
  v_sale_id := (v_result ->> 'sale_id')::uuid;
  if (v_result ->> 'idempotent_replay')::boolean then return v_result; end if;
  select round(sum(unit_price_eur * quantity), 2) into v_total_eur from public.sale_lines where sale_id = v_sale_id;
  for v_payment in select value from jsonb_array_elements(p_payments) loop
    begin v_method := (v_payment ->> 'method')::public.payment_method; v_amount := (v_payment ->> 'amount_eur')::numeric(14,2); exception when others then raise exception 'Invalid payment'; end;
    if v_amount <= 0 then raise exception 'Payment amount must be positive'; end if;
    v_paid_eur := v_paid_eur + v_amount;
    insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur) values (v_sale_id, v_method, v_amount, 'EUR', 1, v_amount);
  end loop;
  if abs(v_paid_eur - v_total_eur) > 0.01 then raise exception 'Payment total must equal sale total'; end if;
  return v_result;
end;
$$;
revoke all on function public.confirm_sale_with_payments(uuid, jsonb, jsonb, uuid, timestamptz) from public;
grant execute on function public.confirm_sale_with_payments(uuid, jsonb, jsonb, uuid, timestamptz) to authenticated;
