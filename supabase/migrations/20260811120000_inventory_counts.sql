-- Zebra Retail · one-time/repeatable owner inventory count documents.

create table public.inventory_counts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'confirmed')),
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  confirmed_by uuid references public.profiles(id) on delete restrict,
  confirmed_at timestamptz,
  idempotency_key uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (store_id, idempotency_key),
  check ((status <> 'confirmed') or (confirmed_by is not null and confirmed_at is not null))
);

create table public.inventory_count_lines (
  id uuid primary key default gen_random_uuid(),
  count_id uuid not null references public.inventory_counts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  expected_quantity integer not null,
  counted_quantity integer not null check (counted_quantity >= 0),
  unique (count_id, variant_id)
);

alter table public.inventory_counts enable row level security;
alter table public.inventory_count_lines enable row level security;
grant select on public.inventory_counts, public.inventory_count_lines to authenticated;
create policy "inventory counts: owner read" on public.inventory_counts for select to authenticated using (public.user_is_store_owner(store_id));
create policy "inventory count lines: owner read" on public.inventory_count_lines for select to authenticated using (
  exists (select 1 from public.inventory_counts c where c.id = count_id and public.user_is_store_owner(c.store_id))
);

create or replace function public.confirm_inventory_count(
  p_store_id uuid,
  p_lines jsonb,
  p_notes text,
  p_idempotency_key uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_count_id uuid;
  v_existing public.inventory_counts;
  v_line jsonb;
  v_variant_id uuid;
  v_counted integer;
  v_expected integer;
  v_delta integer;
  v_movement_id uuid;
  v_seen uuid[] := array[]::uuid[];
  v_changed integer := 0;
begin
  if v_actor_id is null then raise exception 'Authentication is required'; end if;
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can confirm an inventory count'; end if;
  if p_idempotency_key is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'At least one counted variant and an idempotency key are required';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_idempotency_key::text, 0));
  select * into v_existing from public.inventory_counts where store_id = p_store_id and idempotency_key = p_idempotency_key;
  if v_existing.id is not null then return jsonb_build_object('count_id', v_existing.id, 'idempotent_replay', true); end if;

  insert into public.inventory_counts (store_id, status, notes, created_by, confirmed_by, confirmed_at, idempotency_key)
  values (p_store_id, 'draft', nullif(trim(p_notes), ''), v_actor_id, null, null, p_idempotency_key) returning id into v_count_id;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    begin v_variant_id := (v_line ->> 'variant_id')::uuid; v_counted := (v_line ->> 'counted_quantity')::integer;
    exception when others then raise exception 'Each count line requires a variant and a non-negative whole quantity'; end;
    if v_counted < 0 or v_variant_id = any(v_seen) then raise exception 'Count lines must be unique and non-negative'; end if;
    v_seen := array_append(v_seen, v_variant_id);
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || v_variant_id::text, 0));
    if not exists (select 1 from public.product_variants v join public.product_models m on m.id = v.product_model_id where v.id = v_variant_id and m.store_id = p_store_id) then
      raise exception 'Selected variant was not found in this store';
    end if;
    select coalesce(sum(quantity), 0) into v_expected from public.inventory_movements where store_id = p_store_id and variant_id = v_variant_id;
    insert into public.inventory_count_lines (count_id, variant_id, expected_quantity, counted_quantity) values (v_count_id, v_variant_id, v_expected, v_counted);
    v_delta := v_counted - v_expected;
    if v_delta <> 0 then
      insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason, idempotency_key)
      values (p_store_id, v_variant_id, 'adjustment', v_delta, now(), v_actor_id, 'Confirmed inventory count ' || v_count_id::text, gen_random_uuid()) returning id into v_movement_id;
      v_changed := v_changed + 1;
    end if;
  end loop;
  update public.inventory_counts set status = 'confirmed', confirmed_by = v_actor_id, confirmed_at = now() where id = v_count_id;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (p_store_id, v_actor_id, 'inventory.count_confirmed', 'inventory_count', v_count_id, jsonb_build_object('line_count', jsonb_array_length(p_lines), 'changed_variants', v_changed));
  return jsonb_build_object('count_id', v_count_id, 'changed_variants', v_changed, 'idempotent_replay', false);
end;
$$;

revoke all on function public.confirm_inventory_count(uuid, jsonb, text, uuid) from public;
grant execute on function public.confirm_inventory_count(uuid, jsonb, text, uuid) to authenticated;
