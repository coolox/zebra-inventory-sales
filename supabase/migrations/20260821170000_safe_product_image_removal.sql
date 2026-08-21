create or replace function public.remove_product_image(p_store_id uuid, p_model_id uuid, p_storage_path text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_image public.product_images; v_historical boolean; v_model_id uuid;
begin
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can delete product photos'; end if;
  select id into v_model_id from public.product_models where id=p_model_id and store_id=p_store_id for update;
  if not found then raise exception 'Product model is not available in this store'; end if;
  select image.* into v_image from public.product_images image join public.product_models model on model.id=image.product_model_id where image.product_model_id=p_model_id and image.storage_path=p_storage_path and model.store_id=p_store_id for update;
  if not found then return true; end if;
  select exists(select 1 from public.sale_lines where product_image_path=p_storage_path) into v_historical;
  delete from public.product_images where id=v_image.id;
  insert into public.audit_logs(store_id,actor_id,action,entity_type,entity_id,details) values(p_store_id,auth.uid(),'product_image.removed','product_image',v_image.id,jsonb_build_object('storage_path',p_storage_path,'historical_reference_retained',v_historical));
  return not v_historical;
end $$;
revoke all on function public.remove_product_image(uuid,uuid,text) from public;
grant execute on function public.remove_product_image(uuid,uuid,text) to authenticated;
