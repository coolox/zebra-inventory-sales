-- Zebra Retail · audited, idempotent inventory receipt for the clothing pilot.
-- Apply after 20260808123000_foundation.sql.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete restrict,
  actor_id uuid references public.profiles(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_store_created_idx on public.audit_logs (store_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);

grant select on table public.audit_logs to authenticated;
alter table public.audit_logs enable row level security;

create policy "audit logs: owner read" on public.audit_logs for select to authenticated using (
  store_id is not null and public.user_is_store_owner(store_id)
);

create or replace function public.confirm_inventory_receipt(
  p_store_id uuid,
  p_model jsonb,
  p_lines jsonb,
  p_idempotency_key uuid,
  p_received_at timestamptz default now(),
  p_notes text default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_existing_receipt_id uuid;
  v_receipt_id uuid;
  v_supplier_id uuid;
  v_model_id uuid;
  v_variant_id uuid;
  v_line jsonb;
  v_seen_variants uuid[] := array[]::uuid[];
  v_model_code text := nullif(trim(p_model ->> 'model_code'), '');
  v_model_name text := nullif(trim(p_model ->> 'name'), '');
  v_brand text := nullif(trim(p_model ->> 'brand'), '');
  v_category text := nullif(trim(p_model ->> 'category'), '');
  v_gender text := nullif(trim(p_model ->> 'gender'), '');
  v_barcode text := nullif(trim(p_model ->> 'barcode'), '');
  v_supplier_name text := nullif(trim(p_model ->> 'supplier_name'), '');
  v_color text;
  v_size text;
  v_quantity integer;
  v_unit_cost numeric(14, 2);
  v_currency public.currency_code;
  v_rate numeric(18, 8);
  v_variant_count integer := 0;
begin
  if v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_store_id is null or not public.user_has_store_access(p_store_id) then
    raise exception 'No access to this store';
  end if;

  if p_idempotency_key is null then
    raise exception 'Idempotency key is required';
  end if;

  if jsonb_typeof(p_model) <> 'object' or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'Receipt model and at least one line are required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_store_id::text || p_idempotency_key::text, 0)
  );

  select id into v_existing_receipt_id
  from public.purchase_receipts
  where store_id = p_store_id and idempotency_key = p_idempotency_key;

  if v_existing_receipt_id is not null then
    return jsonb_build_object('receipt_id', v_existing_receipt_id, 'idempotent_replay', true);
  end if;

  if v_model_code is null then
    raise exception 'Model code is required';
  end if;

  if v_supplier_name is not null then
    insert into public.suppliers (store_id, name)
    values (p_store_id, v_supplier_name)
    on conflict (store_id, name) do update set name = excluded.name
    returning id into v_supplier_id;
  end if;

  select id into v_model_id
  from public.product_models
  where store_id = p_store_id and model_code = v_model_code;

  if v_model_id is null then
    if v_model_name is null or v_brand is null or v_category is null or v_gender is null then
      raise exception 'New model requires name, brand, category and gender';
    end if;

    if v_gender not in ('men', 'women', 'unisex') then
      raise exception 'Unsupported gender';
    end if;

    insert into public.product_models (
      store_id, supplier_id, model_code, barcode, name, brand, category, gender
    ) values (
      p_store_id, v_supplier_id, v_model_code, v_barcode, v_model_name, v_brand, v_category, v_gender
    ) returning id into v_model_id;
  end if;

  insert into public.purchase_receipts (
    store_id, supplier_id, status, source, received_at, created_by, confirmed_by, confirmed_at, notes, idempotency_key
  ) values (
    p_store_id, v_supplier_id, 'confirmed', 'manual', p_received_at, v_actor_id, v_actor_id, now(), nullif(trim(p_notes), ''), p_idempotency_key
  ) returning id into v_receipt_id;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_color := nullif(trim(v_line ->> 'color'), '');
    v_size := nullif(trim(v_line ->> 'size'), '');

    if v_color is null or v_size is null then
      raise exception 'Each receipt line requires color and size';
    end if;

    begin
      v_quantity := (v_line ->> 'quantity')::integer;
      v_unit_cost := (v_line ->> 'unit_cost')::numeric(14, 2);
      v_currency := upper(v_line ->> 'currency')::public.currency_code;
    exception when others then
      raise exception 'Invalid receipt line quantity, cost or currency';
    end;

    if v_quantity <= 0 or v_unit_cost < 0 then
      raise exception 'Receipt quantity must be positive and cost cannot be negative';
    end if;

    if v_currency = 'EUR' then
      v_rate := 1;
    else
      select eur_rate into v_rate
      from public.exchange_rates
      where business_date = p_received_at::date and currency = v_currency;

      if v_rate is null then
        raise exception 'Owner must set the % exchange rate for % before receiving stock', v_currency, p_received_at::date;
      end if;
    end if;

    insert into public.product_variants (product_model_id, color, size, barcode)
    values (v_model_id, v_color, v_size, nullif(trim(v_line ->> 'barcode'), ''))
    on conflict (product_model_id, color, size) do update set barcode = coalesce(excluded.barcode, public.product_variants.barcode)
    returning id into v_variant_id;

    if v_variant_id = any(v_seen_variants) then
      raise exception 'Duplicate color and size in one receipt';
    end if;
    v_seen_variants := array_append(v_seen_variants, v_variant_id);

    insert into public.purchase_receipt_lines (
      receipt_id, variant_id, quantity, unit_cost, currency, eur_rate, unit_cost_eur
    ) values (
      v_receipt_id, v_variant_id, v_quantity, v_unit_cost, v_currency, v_rate, round(v_unit_cost * v_rate, 2)
    );

    insert into public.inventory_movements (
      store_id, variant_id, movement_type, quantity, occurred_at, actor_id, receipt_line_id, reason
    ) values (
      p_store_id,
      v_variant_id,
      'receipt',
      v_quantity,
      p_received_at,
      v_actor_id,
      (select id from public.purchase_receipt_lines where receipt_id = v_receipt_id and variant_id = v_variant_id),
      'Confirmed manual receipt'
    );

    v_variant_count := v_variant_count + 1;
  end loop;

  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (
    p_store_id,
    v_actor_id,
    'inventory.receipt_confirmed',
    'purchase_receipt',
    v_receipt_id,
    jsonb_build_object('model_code', v_model_code, 'variant_count', v_variant_count, 'source', 'manual')
  );

  return jsonb_build_object(
    'receipt_id', v_receipt_id,
    'model_id', v_model_id,
    'variant_count', v_variant_count,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text) from public;
grant execute on function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text) to authenticated;
