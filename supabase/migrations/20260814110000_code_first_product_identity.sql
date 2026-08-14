-- Zebra Retail · TASK-117
-- Product code is the required human-facing identifier. UUIDs remain the only
-- identifiers used by receipt lines, inventory movements and sales; a barcode
-- is an optional lookup value that may be added or changed independently.

do $$
declare
  duplicate_store_id uuid;
  duplicate_code text;
begin
  select model.store_id, lower(btrim(model.model_code))
  into duplicate_store_id, duplicate_code
  from public.product_models as model
  group by model.store_id, lower(btrim(model.model_code))
  having count(*) > 1
  limit 1;

  if found then
    raise exception 'Cannot enforce normalized product-code uniqueness: store % already has duplicate code "%"', duplicate_store_id, duplicate_code;
  end if;
end;
$$;

alter table public.product_models
  add constraint product_models_model_code_not_blank
  check (nullif(btrim(model_code), '') is not null);

create unique index product_models_store_model_code_normalized_key
  on public.product_models (store_id, lower(btrim(model_code)));

-- A QR scan must be decoded and its payload validated by a future scanner flow.
-- These URI/card payloads are never catalog barcodes and must not be persisted
-- through the manual receipt or any direct catalog write.
do $$
begin
  if exists (
    select 1
    from (
      select barcode from public.product_models
      union all
      select barcode from public.product_variants
    ) as catalog_barcode
    where barcode ~* '^(https?://|mailto:|tel:|sms:|smsto:|geo:|wifi:|mecard:|begin:vcard|otpauth:)'
  ) then
    raise exception 'Cannot apply QR payload guard while a raw QR payload is stored as a barcode; decode and validate it first';
  end if;
end;
$$;

create or replace function public.assert_store_barcode_unique()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  barcode_store_id uuid;
  normalized_barcode text;
begin
  new.barcode := nullif(btrim(new.barcode), '');
  if new.barcode is null then
    return new;
  end if;

  if new.barcode ~* '^(https?://|mailto:|tel:|sms:|smsto:|geo:|wifi:|mecard:|begin:vcard|otpauth:)' then
    raise check_violation using message = 'QR payload must be decoded and validated before it can be stored as a barcode';
  end if;

  normalized_barcode := lower(new.barcode);

  if tg_table_name = 'product_models' then
    barcode_store_id := new.store_id;
  else
    select model.store_id
    into barcode_store_id
    from public.product_models as model
    where model.id = new.product_model_id;
  end if;

  if barcode_store_id is null then
    raise exception 'Variant barcode requires an existing product model';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(barcode_store_id::text || ':' || normalized_barcode, 0)
  );

  if exists (
    select 1
    from public.product_models as model
    where model.store_id = barcode_store_id
      and lower(model.barcode) = normalized_barcode
      and model.id is distinct from new.id
  ) or exists (
    select 1
    from public.product_variants as variant
    join public.product_models as model on model.id = variant.product_model_id
    where model.store_id = barcode_store_id
      and lower(variant.barcode) = normalized_barcode
      and variant.id is distinct from new.id
  ) then
    raise unique_violation using message = format('Barcode "%s" is already assigned in this store', new.barcode);
  end if;

  return new;
end;
$$;
