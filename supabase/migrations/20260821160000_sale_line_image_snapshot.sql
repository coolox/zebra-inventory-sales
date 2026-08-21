-- TASK-186: retain an authorized private image reference at sale time.
alter table public.sale_lines add column product_image_path text;

create function public.snapshot_sale_line_image()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select image.storage_path into new.product_image_path
  from public.product_variants variant join public.product_images image on image.product_model_id = variant.product_model_id
  where variant.id = new.variant_id order by image.position asc limit 1;
  return new;
end $$;
create trigger sale_lines_snapshot_product_image before insert on public.sale_lines for each row execute function public.snapshot_sale_line_image();
