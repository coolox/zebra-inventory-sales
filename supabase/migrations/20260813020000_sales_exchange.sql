-- Zebra Retail · one-for-one exchange ledger. A cheaper replacement never
-- creates a customer credit/refund; an expensive replacement requires a top-up.

create table public.sale_exchanges (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  source_sale_line_id uuid not null references public.sale_lines(id) on delete restrict,
  replacement_variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  source_unit_price_eur numeric(14,2) not null check (source_unit_price_eur > 0),
  replacement_unit_price numeric(14,2) not null check (replacement_unit_price > 0),
  replacement_currency public.currency_code not null,
  replacement_eur_rate numeric(18,8) not null check (replacement_eur_rate > 0),
  replacement_unit_price_eur numeric(14,2) not null check (replacement_unit_price_eur > 0),
  top_up_eur numeric(14,2) not null check (top_up_eur >= 0),
  reason text not null check (btrim(reason) <> ''),
  exchanged_by uuid not null references public.profiles(id) on delete restrict,
  exchanged_at timestamptz not null default now(),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (store_id, idempotency_key)
);

create table public.sale_exchange_payments (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.sale_exchanges(id) on delete restrict,
  method public.payment_method not null,
  amount numeric(14,2) not null check (amount > 0),
  currency public.currency_code not null,
  eur_rate numeric(18,8) not null check (eur_rate > 0),
  amount_eur numeric(14,2) not null check (amount_eur > 0),
  created_at timestamptz not null default now()
);

create index sale_exchanges_source_line_idx on public.sale_exchanges (source_sale_line_id, exchanged_at desc);
create index sale_exchange_payments_exchange_idx on public.sale_exchange_payments (exchange_id);

grant select on public.sale_exchanges, public.sale_exchange_payments to authenticated;
alter table public.sale_exchanges enable row level security;
alter table public.sale_exchange_payments enable row level security;
create policy "sale exchanges: member read" on public.sale_exchanges for select to authenticated using (public.user_has_store_access(store_id));
create policy "sale exchange payments: member read" on public.sale_exchange_payments for select to authenticated using (
  exists (select 1 from public.sale_exchanges exchange where exchange.id = exchange_id and public.user_has_store_access(exchange.store_id))
);

create function public.exchange_sale_line(
  p_store_id uuid,
  p_source_sale_line_id uuid,
  p_replacement_variant_id uuid,
  p_quantity integer,
  p_replacement_unit_price numeric,
  p_replacement_currency text,
  p_payments jsonb,
  p_reason text,
  p_idempotency_key uuid,
  p_exchanged_at timestamptz default now()
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_reason text := btrim(coalesce(p_reason, ''));
  v_source record;
  v_exchange_id uuid;
  v_source_exchanged integer;
  v_target_store_id uuid;
  v_store_timezone text;
  v_business_date date;
  v_replacement_currency public.currency_code;
  v_replacement_rate numeric(18,8);
  v_replacement_unit_eur numeric(14,2);
  v_top_up_eur numeric(14,2);
  v_paid_eur numeric(14,2) := 0;
  v_payment jsonb;
  v_method public.payment_method;
  v_amount numeric(14,2);
  v_currency public.currency_code;
  v_rate numeric(18,8);
  v_amount_eur numeric(14,2);
  v_stock integer;
begin
  if v_actor_id is null or not public.user_has_store_access(p_store_id) then raise exception 'No access to this store'; end if;
  if p_source_sale_line_id is null or p_replacement_variant_id is null or p_quantity is null or p_quantity <= 0 or p_replacement_unit_price is null or p_replacement_unit_price <= 0 or p_idempotency_key is null or v_reason = '' then
    raise exception 'Source line, replacement, positive quantity/price, reason and idempotency key are required';
  end if;
  if jsonb_typeof(p_payments) <> 'array' then raise exception 'Exchange payments must be an array'; end if;
  begin v_replacement_currency := upper(p_replacement_currency)::public.currency_code; exception when others then raise exception 'Invalid replacement currency'; end;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_idempotency_key::text, 0));
  select id into v_exchange_id from public.sale_exchanges where store_id = p_store_id and idempotency_key = p_idempotency_key;
  if v_exchange_id is not null then return jsonb_build_object('exchange_id', v_exchange_id, 'idempotent_replay', true); end if;

  select line.id, line.sale_id, line.variant_id, line.quantity, line.unit_price_eur, sale.status
  into v_source
  from public.sale_lines line join public.sales sale on sale.id = line.sale_id
  where line.id = p_source_sale_line_id and sale.store_id = p_store_id
  for update of line;
  if not found then raise exception 'Source sale line was not found in this store'; end if;
  if v_source.status <> 'confirmed' then raise exception 'Only confirmed source sales can be exchanged'; end if;
  if v_source.unit_price_eur is null then raise exception 'A total-price sale line cannot be exchanged without an explicit price'; end if;
  select coalesce(sum(quantity), 0) into v_source_exchanged from public.sale_exchanges where source_sale_line_id = p_source_sale_line_id;
  if v_source.quantity - v_source_exchanged < p_quantity then raise exception 'Exchange quantity exceeds the remaining source sale line quantity'; end if;

  select model.store_id into v_target_store_id from public.product_variants variant join public.product_models model on model.id = variant.product_model_id where variant.id = p_replacement_variant_id;
  if v_target_store_id is distinct from p_store_id then raise exception 'Replacement variant was not found in this store'; end if;
  select timezone into v_store_timezone from public.stores where id = p_store_id and is_active = true;
  if v_store_timezone is null then raise exception 'Store was not found or is inactive'; end if;
  v_business_date := (p_exchanged_at at time zone v_store_timezone)::date;
  if v_replacement_currency = 'EUR' then v_replacement_rate := 1; else select eur_rate into v_replacement_rate from public.exchange_rates where business_date = v_business_date and currency = v_replacement_currency; if v_replacement_rate is null then raise exception 'Owner must set the % exchange rate before exchanging', v_replacement_currency; end if; end if;
  v_replacement_unit_eur := round(p_replacement_unit_price * v_replacement_rate, 2);
  v_top_up_eur := greatest(round((v_replacement_unit_eur - v_source.unit_price_eur) * p_quantity, 2), 0);

  if v_top_up_eur = 0 and jsonb_array_length(p_payments) <> 0 then raise exception 'Cheaper or equal exchange cannot create a payment, credit or refund'; end if;
  for v_payment in select value from jsonb_array_elements(p_payments) loop
    begin v_method := (v_payment ->> 'method')::public.payment_method; v_amount := (v_payment ->> 'amount')::numeric(14,2); v_currency := upper(v_payment ->> 'currency')::public.currency_code; exception when others then raise exception 'Invalid exchange payment'; end;
    if v_method is null or v_amount is null or v_amount <= 0 or v_currency is null then raise exception 'Exchange payment method, positive amount and currency are required'; end if;
    if v_currency = 'EUR' then v_rate := 1; else select eur_rate into v_rate from public.exchange_rates where business_date = v_business_date and currency = v_currency; if v_rate is null then raise exception 'Owner must set the % exchange rate for exchange payment', v_currency; end if; end if;
    v_amount_eur := round(v_amount * v_rate, 2);
    v_paid_eur := v_paid_eur + v_amount_eur;
  end loop;
  v_paid_eur := round(v_paid_eur, 2);
  if v_top_up_eur > 0 and abs(v_paid_eur - v_top_up_eur) > 0.01 then raise exception 'Exchange payment total must equal the top-up'; end if;

  -- Lock the two variant balances in a stable order to avoid exchange deadlocks.
  if v_source.variant_id::text <= p_replacement_variant_id::text then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || v_source.variant_id::text, 0));
    if v_source.variant_id <> p_replacement_variant_id then perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_replacement_variant_id::text, 0)); end if;
  else
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_replacement_variant_id::text, 0));
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || v_source.variant_id::text, 0));
  end if;
  select coalesce(sum(quantity), 0) into v_stock from public.inventory_movements where store_id = p_store_id and variant_id = p_replacement_variant_id;
  if (v_stock + case when p_replacement_variant_id = v_source.variant_id then p_quantity else 0 end) < p_quantity then raise exception 'Insufficient stock for replacement variant'; end if;

  insert into public.sale_exchanges (store_id, source_sale_line_id, replacement_variant_id, quantity, source_unit_price_eur, replacement_unit_price, replacement_currency, replacement_eur_rate, replacement_unit_price_eur, top_up_eur, reason, exchanged_by, exchanged_at, idempotency_key)
  values (p_store_id, p_source_sale_line_id, p_replacement_variant_id, p_quantity, v_source.unit_price_eur, p_replacement_unit_price, v_replacement_currency, v_replacement_rate, v_replacement_unit_eur, v_top_up_eur, v_reason, v_actor_id, p_exchanged_at, p_idempotency_key)
  returning id into v_exchange_id;
  insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason)
  values (p_store_id, v_source.variant_id, 'exchange_in', p_quantity, p_exchanged_at, v_actor_id, v_reason),
         (p_store_id, p_replacement_variant_id, 'exchange_out', -p_quantity, p_exchanged_at, v_actor_id, v_reason);
  for v_payment in select value from jsonb_array_elements(p_payments) loop
    v_method := (v_payment ->> 'method')::public.payment_method; v_amount := (v_payment ->> 'amount')::numeric(14,2); v_currency := upper(v_payment ->> 'currency')::public.currency_code;
    if v_currency = 'EUR' then v_rate := 1; else select eur_rate into v_rate from public.exchange_rates where business_date = v_business_date and currency = v_currency; end if;
    insert into public.sale_exchange_payments (exchange_id, method, amount, currency, eur_rate, amount_eur) values (v_exchange_id, v_method, v_amount, v_currency, v_rate, round(v_amount * v_rate, 2));
  end loop;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (p_store_id, v_actor_id, 'sale.exchanged', 'sale_exchange', v_exchange_id, jsonb_build_object('source_sale_line_id', p_source_sale_line_id, 'replacement_variant_id', p_replacement_variant_id, 'quantity', p_quantity, 'top_up_eur', v_top_up_eur, 'reason', v_reason));
  return jsonb_build_object('exchange_id', v_exchange_id, 'top_up_eur', v_top_up_eur, 'idempotent_replay', false);
end;
$$;

revoke all on function public.exchange_sale_line(uuid, uuid, uuid, integer, numeric, text, jsonb, text, uuid, timestamptz) from public;
grant execute on function public.exchange_sale_line(uuid, uuid, uuid, integer, numeric, text, jsonb, text, uuid, timestamptz) to authenticated;

-- Rollback outline: after exporting exchange/audit ledger records, revoke/drop the
-- RPC and its read policies, then drop payment rows/table before sale_exchanges.
