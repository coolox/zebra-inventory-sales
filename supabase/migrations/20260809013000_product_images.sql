-- Zebra Retail · private product photos for the clothing pilot.
-- Apply after 20260808123000_foundation.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.product_image_store_id(p_path text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return split_part(p_path, '/', 1)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create policy "product images: store member read"
on storage.objects for select to authenticated
using (
  bucket_id = 'product-images'
  and public.user_has_store_access(public.product_image_store_id(name))
);

create policy "product images: store member upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and public.user_has_store_access(public.product_image_store_id(name))
);

create policy "product images: store member delete own store"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and public.user_has_store_access(public.product_image_store_id(name))
);

create or replace function public.add_product_image(
  p_model_id uuid,
  p_storage_path text
)
returns public.product_images
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_store_id uuid;
  v_image public.product_images;
  v_expected_prefix text;
begin
  if v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  select store_id into v_store_id
  from public.product_models
  where id = p_model_id and is_active = true;

  if v_store_id is null or not public.user_has_store_access(v_store_id) then
    raise exception 'No access to this product';
  end if;

  v_expected_prefix := v_store_id::text || '/' || p_model_id::text || '/';
  if p_storage_path is null or p_storage_path !~ ('^' || v_expected_prefix || '[0-9a-f-]+[.](jpg|png|webp)$') then
    raise exception 'Invalid product image path';
  end if;

  insert into public.product_images (product_model_id, storage_path, alt_text, position)
  values (
    p_model_id,
    p_storage_path,
    null,
    coalesce((select max(position) + 1 from public.product_images where product_model_id = p_model_id), 0)
  )
  returning * into v_image;

  return v_image;
end;
$$;

revoke all on function public.add_product_image(uuid, text) from public;
grant execute on function public.add_product_image(uuid, text) to authenticated;
