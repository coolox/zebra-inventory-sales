-- Zebra Retail · atomic sales foundation for the clothing pilot.
-- Apply after receipt and FX migrations.

create type public.sale_status as enum ('confirmed', 'cancelled');
create type public.payment_method as enum ('cash', 'card', 'bank_transfer');

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  status public.sale_status not null default 'confirmed',
  sold_at timestamptz not null default now(),
  idempotency_key uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (store_id, idempotency_key)
);

create table public.sale_lines (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price > 0),
  currency public.currency_code not null,
  eur_rate numeric(18,8) not null check (eur_rate > 0),
  unit_price_eur numeric(14,2) not null check (unit_price_eur > 0),
  unit_cost_eur numeric(14,2) not null check (unit_cost_eur >= 0),
  created_at timestamptz not null default now(),
  unique (sale_id, variant_id)
);

create table public.sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  method public.payment_method not null,
  amount numeric(14,2) not null check (amount > 0),
  currency public.currency_code not null,
  eur_rate numeric(18,8) not null check (eur_rate > 0),
  amount_eur numeric(14,2) not null check (amount_eur > 0),
  created_at timestamptz not null default now()
);

grant select on public.sales, public.sale_lines, public.sale_payments to authenticated;
alter table public.sales enable row level security;
alter table public.sale_lines enable row level security;
alter table public.sale_payments enable row level security;
create policy "sales: store member read" on public.sales for select to authenticated using (public.user_has_store_access(store_id));
create policy "sale lines: store member read" on public.sale_lines for select to authenticated using (exists (select 1 from public.sales sale where sale.id = sale_id and public.user_has_store_access(sale.store_id)));
create policy "sale payments: store member read" on public.sale_payments for select to authenticated using (exists (select 1 from public.sales sale where sale.id = sale_id and public.user_has_store_access(sale.store_id)));

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
begin
  if v_actor_id is null or not public.user_has_store_access(p_store_id) then raise exception 'No access to this store'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 or p_idempotency_key is null then raise exception 'Sale lines and idempotency key are required'; end if;
  select timezone into v_store_timezone from public.stores where id = p_store_id and is_active = true;
  if v_store_timezone is null then raise exception 'Store was not found or is inactive'; end if;
  v_business_date := (p_sold_at at time zone v_store_timezone)::date;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_idempotency_key::text, 0));
  select id into v_sale_id from public.sales where store_id = p_store_id and idempotency_key = p_idempotency_key;
  if v_sale_id is not null then return jsonb_build_object('sale_id', v_sale_id, 'idempotent_replay', true); end if;
  insert into public.sales (store_id, seller_id, sold_at, idempotency_key) values (p_store_id, v_actor_id, p_sold_at, p_idempotency_key) returning id into v_sale_id;
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
    insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason) values (p_store_id, v_variant_id, 'sale', -v_quantity, p_sold_at, v_actor_id, 'Confirmed sale');
  end loop;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details) values (p_store_id, v_actor_id, 'sale.confirmed', 'sale', v_sale_id, jsonb_build_object('source', 'web'));
  return jsonb_build_object('sale_id', v_sale_id, 'idempotent_replay', false);
end;
$$;
revoke all on function public.confirm_sale(uuid, jsonb, uuid, timestamptz) from public;
grant execute on function public.confirm_sale(uuid, jsonb, uuid, timestamptz) to authenticated;
