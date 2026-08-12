-- Zebra Retail · Owner-only, audited inventory corrections.

create or replace function public.confirm_inventory_adjustment(
  p_store_id uuid,
  p_variant_id uuid,
  p_quantity_delta integer,
  p_reason text,
  p_idempotency_key uuid
)
returns public.inventory_movements language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_reason text := nullif(trim(p_reason), '');
  v_stock integer;
  v_movement public.inventory_movements;
begin
  if v_actor_id is null then raise exception 'Authentication is required'; end if;
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can adjust inventory'; end if;
  if p_variant_id is null or p_quantity_delta is null or p_quantity_delta = 0 or v_reason is null or p_idempotency_key is null then
    raise exception 'Variant, non-zero quantity, reason and idempotency key are required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_variant_id::text, 0));
  select * into v_movement from public.inventory_movements where store_id = p_store_id and idempotency_key = p_idempotency_key;
  if v_movement.id is not null then return v_movement; end if;
  select coalesce(sum(quantity), 0) into v_stock
  from public.inventory_movements where store_id = p_store_id and variant_id = p_variant_id;

  if not exists (
    select 1 from public.product_variants variant
    join public.product_models model on model.id = variant.product_model_id
    where variant.id = p_variant_id and model.store_id = p_store_id
  ) then raise exception 'Selected variant was not found in this store'; end if;
  if v_stock + p_quantity_delta < 0 then raise exception 'Adjustment would make stock negative'; end if;

  insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason, idempotency_key)
  values (p_store_id, p_variant_id, 'adjustment', p_quantity_delta, now(), v_actor_id, v_reason, p_idempotency_key)
  returning * into v_movement;

  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (p_store_id, v_actor_id, 'inventory.adjusted', 'inventory_movement', v_movement.id,
    jsonb_build_object('variant_id', p_variant_id, 'quantity_delta', p_quantity_delta, 'stock_before', v_stock, 'stock_after', v_stock + p_quantity_delta, 'reason', v_reason));
  return v_movement;
end;
$$;

revoke all on function public.confirm_inventory_adjustment(uuid, uuid, integer, text, uuid) from public;
grant execute on function public.confirm_inventory_adjustment(uuid, uuid, integer, text, uuid) to authenticated;
