-- Zebra Retail · unambiguous, store-scoped catalog barcode ownership.
-- A barcode may belong to either a model or a variant, but never to more than
-- one catalog record in the same store. The same barcode is allowed in a
-- different store because catalogs are store-scoped.

update public.product_models
set barcode = nullif(btrim(barcode), '')
where barcode is not null;

update public.product_variants
set barcode = nullif(btrim(barcode), '')
where barcode is not null;

do $$
declare
  duplicate_store_id uuid;
  duplicate_barcode text;
begin
  select claim.store_id, claim.normalized_barcode
  into duplicate_store_id, duplicate_barcode
  from (
    select model.store_id, lower(btrim(model.barcode)) as normalized_barcode
    from public.product_models as model
    where model.barcode is not null

    union all

    select model.store_id, lower(btrim(variant.barcode)) as normalized_barcode
    from public.product_variants as variant
    join public.product_models as model on model.id = variant.product_model_id
    where variant.barcode is not null
  ) as claim
  group by claim.store_id, claim.normalized_barcode
  having count(*) > 1
  limit 1;

  if found then
    raise exception 'Cannot apply barcode uniqueness: store % already has more than one claim for barcode "%"', duplicate_store_id, duplicate_barcode;
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

  -- The lock also closes the cross-table race between a model and a variant
  -- trying to claim the same barcode in parallel.
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

create trigger product_models_barcode_unique
before insert or update of barcode, store_id on public.product_models
for each row execute procedure public.assert_store_barcode_unique();

create trigger product_variants_barcode_unique
before insert or update of barcode, product_model_id on public.product_variants
for each row execute procedure public.assert_store_barcode_unique();

create index product_models_store_barcode_lookup_idx
on public.product_models (store_id, lower(barcode))
where barcode is not null;

create index product_variants_barcode_lookup_idx
on public.product_variants (lower(barcode))
where barcode is not null;
