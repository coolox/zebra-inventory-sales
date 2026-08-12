-- Zebra Retail · native-currency sale payments.
-- Apply after 20260809024500_mixed_sale_payments.sql and
-- 20260809153000_sale_line_identity.sql.

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
  v_currency public.currency_code;
  v_rate numeric(18,8);
  v_amount_eur numeric(14,2);
  v_store_timezone text;
  v_business_date date;
begin
  if jsonb_typeof(p_payments) <> 'array' or jsonb_array_length(p_payments) = 0 then
    raise exception 'At least one payment is required';
  end if;

  v_result := public.confirm_sale(p_store_id, p_lines, p_idempotency_key, p_sold_at);
  v_sale_id := (v_result ->> 'sale_id')::uuid;
  if (v_result ->> 'idempotent_replay')::boolean then return v_result; end if;

  select timezone into v_store_timezone
  from public.stores
  where id = p_store_id and is_active = true;
  if v_store_timezone is null then raise exception 'Store was not found or is inactive'; end if;
  v_business_date := (p_sold_at at time zone v_store_timezone)::date;

  select round(sum(unit_price_eur * quantity), 2)
  into v_total_eur
  from public.sale_lines
  where sale_id = v_sale_id;

  for v_payment in select value from jsonb_array_elements(p_payments) loop
    begin
      v_method := (v_payment ->> 'method')::public.payment_method;
      v_amount := (v_payment ->> 'amount')::numeric(14,2);
      v_currency := upper(v_payment ->> 'currency')::public.currency_code;
    exception when others then
      raise exception 'Invalid payment';
    end;

    if v_method is null or v_currency is null or v_amount is null or v_amount <= 0 then
      raise exception 'Payment method, currency and positive amount are required';
    end if;

    if v_currency = 'EUR' then
      v_rate := 1;
    else
      select eur_rate into v_rate
      from public.exchange_rates
      where business_date = v_business_date and currency = v_currency;
      if v_rate is null then
        raise exception 'Owner must set the % exchange rate for payment before selling', v_currency;
      end if;
    end if;

    v_amount_eur := round(v_amount * v_rate, 2);
    v_paid_eur := v_paid_eur + v_amount_eur;
    insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur)
    values (v_sale_id, v_method, v_amount, v_currency, v_rate, v_amount_eur);
  end loop;

  if abs(v_paid_eur - v_total_eur) > 0.01 then
    raise exception 'Payment total must equal sale total';
  end if;

  return v_result;
end;
$$;

revoke all on function public.confirm_sale_with_payments(uuid, jsonb, jsonb, uuid, timestamptz) from public;
grant execute on function public.confirm_sale_with_payments(uuid, jsonb, jsonb, uuid, timestamptz) to authenticated;
