-- Zebra Retail · sale-level pricing for multi-item package sales.
-- Apply after 20260809160000_native_currency_payments.sql.

create type public.sale_pricing_mode as enum ('per_item', 'sale_total');

alter table public.sales
  add column pricing_mode public.sale_pricing_mode not null default 'per_item',
  add column total_amount_eur numeric(14,2) not null default 0 check (total_amount_eur >= 0);

update public.sales sale
set total_amount_eur = coalesce((
  select round(sum(line.unit_price_eur * line.quantity), 2)
  from public.sale_lines line
  where line.sale_id = sale.id
), 0);

alter table public.sale_lines
  alter column unit_price drop not null,
  alter column currency drop not null,
  alter column eur_rate drop not null,
  alter column unit_price_eur drop not null;

alter table public.sale_lines
  add constraint sale_lines_pricing_shape_check check (
    (unit_price is not null and currency is not null and eur_rate is not null and unit_price_eur is not null)
    or
    (unit_price is null and currency is null and eur_rate is null and unit_price_eur is null)
  );

create unique index sale_lines_total_price_variant_key
  on public.sale_lines (sale_id, variant_id)
  where unit_price is null;

create or replace function public.confirm_sale(
  p_store_id uuid,
  p_lines jsonb,
  p_idempotency_key uuid,
  p_sold_at timestamptz default now()
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_sale_id uuid;
  v_line jsonb;
  v_variant_id uuid;
  v_quantity integer;
  v_price numeric(14,2);
  v_currency public.currency_code;
  v_rate numeric(18,8);
  v_cost numeric(14,2);
  v_stock integer;
  v_store_timezone text;
  v_business_date date;
  v_total_eur numeric(14,2) := 0;
begin
  if v_actor_id is null or not public.user_has_store_access(p_store_id) then raise exception 'No access to this store'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 or p_idempotency_key is null then raise exception 'Sale lines and idempotency key are required'; end if;
  select timezone into v_store_timezone from public.stores where id = p_store_id and is_active = true;
  if v_store_timezone is null then raise exception 'Store was not found or is inactive'; end if;
  v_business_date := (p_sold_at at time zone v_store_timezone)::date;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_idempotency_key::text, 0));
  select id into v_sale_id from public.sales where store_id = p_store_id and idempotency_key = p_idempotency_key;
  if v_sale_id is not null then return jsonb_build_object('sale_id', v_sale_id, 'idempotent_replay', true); end if;
  insert into public.sales (store_id, seller_id, sold_at, idempotency_key, pricing_mode) values (p_store_id, v_actor_id, p_sold_at, p_idempotency_key, 'per_item') returning id into v_sale_id;
  for v_line in select value from jsonb_array_elements(p_lines) loop
    begin v_variant_id := (v_line ->> 'variant_id')::uuid; v_quantity := (v_line ->> 'quantity')::integer; v_price := (v_line ->> 'unit_price')::numeric(14,2); v_currency := upper(v_line ->> 'currency')::public.currency_code; exception when others then raise exception 'Invalid sale line'; end;
    if v_quantity <= 0 or v_price <= 0 then raise exception 'Sale quantity and price must be positive'; end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || v_variant_id::text, 0));
    select coalesce(sum(quantity), 0) into v_stock from public.inventory_movements where store_id = p_store_id and variant_id = v_variant_id;
    if v_stock < v_quantity then raise exception 'Insufficient stock for selected variant'; end if;
    if v_currency = 'EUR' then v_rate := 1; else select eur_rate into v_rate from public.exchange_rates where business_date = v_business_date and currency = v_currency; if v_rate is null then raise exception 'Owner must set the % exchange rate for % before selling', v_currency, v_business_date; end if; end if;
    select unit_cost_eur into v_cost from public.purchase_receipt_lines where variant_id = v_variant_id order by created_at desc limit 1;
    if v_cost is null then raise exception 'Selected variant has no purchase cost'; end if;
    insert into public.sale_lines (sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values (v_sale_id, v_variant_id, v_quantity, v_price, v_currency, v_rate, round(v_price * v_rate, 2), v_cost);
    v_total_eur := v_total_eur + round(v_price * v_rate, 2) * v_quantity;
    insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason) values (p_store_id, v_variant_id, 'sale', -v_quantity, p_sold_at, v_actor_id, 'Confirmed sale');
  end loop;
  update public.sales set total_amount_eur = round(v_total_eur, 2) where id = v_sale_id;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details) values (p_store_id, v_actor_id, 'sale.confirmed', 'sale', v_sale_id, jsonb_build_object('source', 'web', 'pricing_mode', 'per_item'));
  return jsonb_build_object('sale_id', v_sale_id, 'idempotent_replay', false);
end;
$$;

drop function public.confirm_sale_with_payments(uuid, jsonb, jsonb, uuid, timestamptz);

create function public.confirm_sale_with_payments(
  p_store_id uuid,
  p_lines jsonb,
  p_payments jsonb,
  p_idempotency_key uuid,
  p_sold_at timestamptz default now(),
  p_pricing_mode public.sale_pricing_mode default 'per_item'
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_result jsonb;
  v_sale_id uuid;
  v_total_eur numeric(14,2) := 0;
  v_payment jsonb;
  v_paid_eur numeric(14,2) := 0;
  v_method public.payment_method;
  v_amount numeric(14,2);
  v_currency public.currency_code;
  v_rate numeric(18,8);
  v_amount_eur numeric(14,2);
  v_store_timezone text;
  v_business_date date;
  v_line jsonb;
  v_variant_id uuid;
  v_quantity integer;
  v_cost numeric(14,2);
  v_stock integer;
begin
  if v_actor_id is null or not public.user_has_store_access(p_store_id) then raise exception 'No access to this store'; end if;
  if jsonb_typeof(p_payments) <> 'array' or jsonb_array_length(p_payments) = 0 then raise exception 'At least one payment is required'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 or p_idempotency_key is null then raise exception 'Sale lines and idempotency key are required'; end if;
  select timezone into v_store_timezone from public.stores where id = p_store_id and is_active = true;
  if v_store_timezone is null then raise exception 'Store was not found or is inactive'; end if;
  v_business_date := (p_sold_at at time zone v_store_timezone)::date;

  if p_pricing_mode = 'per_item' then
    v_result := public.confirm_sale(p_store_id, p_lines, p_idempotency_key, p_sold_at);
    v_sale_id := (v_result ->> 'sale_id')::uuid;
    if (v_result ->> 'idempotent_replay')::boolean then return v_result; end if;
    select total_amount_eur into v_total_eur from public.sales where id = v_sale_id;
  else
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_idempotency_key::text, 0));
    select id into v_sale_id from public.sales where store_id = p_store_id and idempotency_key = p_idempotency_key;
    if v_sale_id is not null then return jsonb_build_object('sale_id', v_sale_id, 'idempotent_replay', true); end if;
  end if;

  for v_payment in select value from jsonb_array_elements(p_payments) loop
    begin v_method := (v_payment ->> 'method')::public.payment_method; v_amount := (v_payment ->> 'amount')::numeric(14,2); v_currency := upper(v_payment ->> 'currency')::public.currency_code; exception when others then raise exception 'Invalid payment'; end;
    if v_method is null or v_currency is null or v_amount is null or v_amount <= 0 then raise exception 'Payment method, currency and positive amount are required'; end if;
    if v_currency = 'EUR' then v_rate := 1; else select eur_rate into v_rate from public.exchange_rates where business_date = v_business_date and currency = v_currency; if v_rate is null then raise exception 'Owner must set the % exchange rate for payment before selling', v_currency; end if; end if;
    v_paid_eur := v_paid_eur + round(v_amount * v_rate, 2);
  end loop;
  v_paid_eur := round(v_paid_eur, 2);

  if p_pricing_mode = 'per_item' and abs(v_paid_eur - v_total_eur) > 0.01 then raise exception 'Payment total must equal sale total'; end if;

  if p_pricing_mode = 'sale_total' then
    if v_paid_eur <= 0 then raise exception 'Sale total must be positive'; end if;
    insert into public.sales (store_id, seller_id, sold_at, idempotency_key, pricing_mode, total_amount_eur) values (p_store_id, v_actor_id, p_sold_at, p_idempotency_key, 'sale_total', v_paid_eur) returning id into v_sale_id;
    for v_line in select value from jsonb_array_elements(p_lines) loop
      begin v_variant_id := (v_line ->> 'variant_id')::uuid; v_quantity := (v_line ->> 'quantity')::integer; exception when others then raise exception 'Invalid sale line'; end;
      if v_quantity is null or v_quantity <= 0 then raise exception 'Sale quantity must be positive'; end if;
      perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || v_variant_id::text, 0));
      select coalesce(sum(quantity), 0) into v_stock from public.inventory_movements where store_id = p_store_id and variant_id = v_variant_id;
      if v_stock < v_quantity then raise exception 'Insufficient stock for selected variant'; end if;
      select unit_cost_eur into v_cost from public.purchase_receipt_lines where variant_id = v_variant_id order by created_at desc limit 1;
      if v_cost is null then raise exception 'Selected variant has no purchase cost'; end if;
      insert into public.sale_lines as existing_line (sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur)
      values (v_sale_id, v_variant_id, v_quantity, null, null, null, null, v_cost)
      on conflict (sale_id, variant_id) where unit_price is null do update set quantity = existing_line.quantity + excluded.quantity;
      insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason) values (p_store_id, v_variant_id, 'sale', -v_quantity, p_sold_at, v_actor_id, 'Confirmed total-price sale');
    end loop;
  end if;

  for v_payment in select value from jsonb_array_elements(p_payments) loop
    v_method := (v_payment ->> 'method')::public.payment_method;
    v_amount := (v_payment ->> 'amount')::numeric(14,2);
    v_currency := upper(v_payment ->> 'currency')::public.currency_code;
    if v_currency = 'EUR' then v_rate := 1; else select eur_rate into v_rate from public.exchange_rates where business_date = v_business_date and currency = v_currency; end if;
    v_amount_eur := round(v_amount * v_rate, 2);
    insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur) values (v_sale_id, v_method, v_amount, v_currency, v_rate, v_amount_eur);
  end loop;

  if p_pricing_mode = 'sale_total' then
    insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details) values (p_store_id, v_actor_id, 'sale.confirmed', 'sale', v_sale_id, jsonb_build_object('source', 'web', 'pricing_mode', 'sale_total'));
  end if;
  return jsonb_build_object('sale_id', v_sale_id, 'idempotent_replay', false);
end;
$$;

revoke all on function public.confirm_sale_with_payments(uuid, jsonb, jsonb, uuid, timestamptz, public.sale_pricing_mode) from public;
grant execute on function public.confirm_sale_with_payments(uuid, jsonb, jsonb, uuid, timestamptz, public.sale_pricing_mode) to authenticated;

-- Rollback outline: restore the previous RPCs, remove total-price rows after an
-- explicit data export, then drop the partial index/shape constraint, restore
-- NOT NULL sale-line price columns, and finally drop the two sales columns/type.
