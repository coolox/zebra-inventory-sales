-- Zebra Retail · canonical colour storage for manual receipts.
-- UI labels stay locale-specific; the database keeps the stable English value.

create or replace function public.canonical_catalog_color(p_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select case regexp_replace(lower(btrim(p_value)), '\s+', ' ', 'g')
    when 'black' then 'Black' when 'siyah' then 'Black'
    when 'white' then 'White' when 'beyaz' then 'White'
    when 'blue' then 'Blue' when 'mavi' then 'Blue'
    when 'beige' then 'Beige' when 'bej' then 'Beige'
    when 'grey' then 'Grey' when 'gray' then 'Grey' when 'gri' then 'Grey'
    when 'brown' then 'Brown' when 'kahverengi' then 'Brown'
    when 'navy' then 'Navy' when 'lacivert' then 'Navy'
    when 'darkblue' then 'Navy' when 'dark blue' then 'Navy'
    when 'stone' then 'Stone' when 'soil' then 'Stone'
    when 'ecru' then 'Ecru' when 'ekru' then 'Ecru'
    else initcap(regexp_replace(lower(btrim(p_value)), '\s+', ' ', 'g'))
  end;
$$;

-- Keep the existing Istanbul business-date wrapper, but canonicalize line colours
-- before the atomic receipt implementation resolves/creates a variant.
create or replace function public.confirm_inventory_receipt(
  p_store_id uuid,
  p_model jsonb,
  p_lines jsonb,
  p_idempotency_key uuid,
  p_received_at timestamptz default now(),
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_timezone text;
  v_canonical_lines jsonb := p_lines;
begin
  select timezone into v_timezone
  from public.stores
  where id = p_store_id and is_active = true;

  if v_timezone is null then
    raise exception 'Store was not found or is inactive';
  end if;

  if jsonb_typeof(p_lines) = 'array' then
    select coalesce(
      jsonb_agg(
        case when jsonb_typeof(line.value) = 'object' then
          jsonb_set(
            line.value,
            '{color}',
            to_jsonb(coalesce(public.canonical_catalog_color(line.value ->> 'color'), '')),
            true
          )
        else line.value end
      ),
      '[]'::jsonb
    ) into v_canonical_lines
    from jsonb_array_elements(p_lines) as line(value);
  end if;

  perform pg_catalog.set_config('TimeZone', v_timezone, true);

  return public.confirm_inventory_receipt_internal(
    p_store_id,
    p_model,
    v_canonical_lines,
    p_idempotency_key,
    p_received_at,
    p_notes
  );
end;
$$;

revoke all on function public.canonical_catalog_color(text) from public;
grant execute on function public.canonical_catalog_color(text) to authenticated;
revoke all on function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text) from public;
grant execute on function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text) to authenticated;

-- Owner-approved TASK-118 cleanup. These UUIDs are the audited staging-only
-- legacy records; in clean/local/future production databases the CTE is empty.
-- A unique-key conflict makes the complete migration fail rather than merging
-- variants or changing a different record.
with changes(variant_id, old_color, new_color) as (
  values
    ('cac3d201-6317-4786-92e8-8a3a5791487e'::uuid, 'mavi', 'Blue'),
    ('4bf39a96-8b62-4cca-a0c6-d306eca03757'::uuid, 'mavi', 'Blue'),
    ('75fa4bb8-2644-46bf-b7b8-9036954b2039'::uuid, 'mavi', 'Blue'),
    ('30fdf622-d6e5-41be-b26d-5e3fdf340566'::uuid, 'mavi', 'Blue'),
    ('61e9c765-5114-434d-9e8c-a43e00dfc367'::uuid, 'mavi', 'Blue'),
    ('8f83831b-f8da-45b4-9cff-95f9950c05c8'::uuid, 'mavi', 'Blue'),
    ('760d3ffe-8f1b-4773-a471-d2c8856529cd'::uuid, 'siyah', 'Black'),
    ('fc8bf5a4-b0fe-4e8f-bc60-8b87da3265f2'::uuid, 'siyah', 'Black'),
    ('5d332f4b-1808-4e44-ad07-5e0c2012faa3'::uuid, 'siyah', 'Black'),
    ('b0a80058-7ae5-450d-94c8-bac6addca949'::uuid, 'siyah', 'Black'),
    ('a0580a24-67fd-4ba8-86fb-b0c263ac8b53'::uuid, 'Bej', 'Beige'),
    ('72098f44-6a71-4d2d-81ee-7a63eb93c4e8'::uuid, 'Bej', 'Beige'),
    ('cfd9015a-98a9-46c6-8e8e-beb8adc1240d'::uuid, 'Bej', 'Beige')
), updated as (
  update public.product_variants variant
  set color = changes.new_color
  from changes
  where variant.id = changes.variant_id
    and variant.color = changes.old_color
  returning variant.id, variant.product_model_id, changes.old_color, changes.new_color
)
insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
select model.store_id, null, 'catalog.color_normalized', 'product_variant', updated.id,
  jsonb_build_object(
    'old_color', updated.old_color,
    'new_color', updated.new_color,
    'source', 'TASK-118 owner-approved staging cleanup'
  )
from updated
join public.product_models model on model.id = updated.product_model_id;

-- Rollback (only before a later receipt uses these canonical values): update the
-- exact audited UUIDs back to the `old_color` values above, then remove the 13
-- `catalog.color_normalized` audit entries by their source field. Archive rollback
-- is performed through set_product_model_archived(..., false), never by deletion.
