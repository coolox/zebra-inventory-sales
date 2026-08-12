-- Zebra Retail · reversible product-model archive for the clothing catalog.
-- A model is never deleted: receipts, movements and sales keep their links.

create or replace function public.set_product_model_archived(
  p_store_id uuid,
  p_model_id uuid,
  p_archived boolean
)
returns public.product_models language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_model public.product_models;
begin
  if v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_store_id is null or p_model_id is null or p_archived is null then
    raise exception 'Store, product model and archive state are required';
  end if;

  if not public.user_is_store_owner(p_store_id) then
    raise exception 'Only an Owner can archive or restore product models';
  end if;

  select * into v_model
  from public.product_models
  where id = p_model_id and store_id = p_store_id
  for update;

  if v_model.id is null then
    raise exception 'Product model was not found in this store';
  end if;

  -- Idempotency makes a retry safe and avoids duplicate audit records.
  if v_model.is_active = not p_archived then
    return v_model;
  end if;

  update public.product_models
  set is_active = not p_archived,
      updated_at = now()
  where id = v_model.id
  returning * into v_model;

  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (
    p_store_id,
    v_actor_id,
    case when p_archived then 'product_model.archived' else 'product_model.restored' end,
    'product_model',
    v_model.id,
    jsonb_build_object('model_code', v_model.model_code, 'is_active', v_model.is_active)
  );

  return v_model;
end;
$$;

revoke all on function public.set_product_model_archived(uuid, uuid, boolean) from public;
grant execute on function public.set_product_model_archived(uuid, uuid, boolean) to authenticated;

-- The UI removes archived models from the sale picker. This guard also protects
-- direct/stale RPC calls and both sale-pricing modes.
create or replace function public.reject_archived_model_sale()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.movement_type = 'sale' and not exists (
    select 1
    from public.product_variants variant
    join public.product_models model on model.id = variant.product_model_id
    where variant.id = new.variant_id
      and model.store_id = new.store_id
      and model.is_active = true
      and variant.is_active = true
  ) then
    raise exception 'Archived or inactive products cannot be sold';
  end if;
  return new;
end;
$$;

drop trigger if exists inventory_movements_reject_archived_model_sale on public.inventory_movements;
create trigger inventory_movements_reject_archived_model_sale
before insert on public.inventory_movements
for each row execute function public.reject_archived_model_sale();
