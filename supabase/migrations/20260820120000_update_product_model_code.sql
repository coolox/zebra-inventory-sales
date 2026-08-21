-- Zebra Retail · TASK-162
-- Product code can be corrected without replacing the model UUID or any ledger data.

create or replace function public.update_product_model_code(
  p_store_id uuid,
  p_model_id uuid,
  p_model_code text
)
returns public.product_models
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_code text := btrim(p_model_code);
  v_model public.product_models;
  v_updated public.product_models;
begin
  if v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_store_id is null or p_model_id is null or nullif(v_code, '') is null then
    raise exception 'Store, product model and a non-empty product code are required';
  end if;

  if not public.user_is_store_owner(p_store_id) then
    raise exception 'Only an Owner can edit product codes';
  end if;

  select *
  into v_model
  from public.product_models
  where id = p_model_id
    and store_id = p_store_id
  for update;

  if not found then
    raise exception 'Product model is not available in this store';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_store_id::text || ':' || lower(v_code), 0)
  );

  if exists (
    select 1
    from public.product_models as model
    where model.store_id = p_store_id
      and lower(btrim(model.model_code)) = lower(v_code)
      and model.id <> p_model_id
  ) then
    raise unique_violation using message = format('Product code "%s" is already used in this store', v_code);
  end if;

  if v_model.model_code = v_code then
    return v_model;
  end if;

  update public.product_models
  set model_code = v_code,
      updated_at = now()
  where id = p_model_id
  returning * into v_updated;

  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (
    p_store_id,
    v_actor_id,
    'product_model.code_updated',
    'product_model',
    p_model_id,
    jsonb_build_object('old_model_code', v_model.model_code, 'new_model_code', v_code)
  );

  return v_updated;
end;
$$;

revoke all on function public.update_product_model_code(uuid, uuid, text) from public;
grant execute on function public.update_product_model_code(uuid, uuid, text) to authenticated;
