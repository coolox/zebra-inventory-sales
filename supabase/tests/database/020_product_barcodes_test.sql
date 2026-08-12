begin;

select plan(7);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000201', 'authenticated', 'authenticated', 'barcode-owner-a@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000202', 'authenticated', 'authenticated', 'barcode-owner-b@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name)
values
  ('00000000-0000-0000-0000-000000000211', 'barcode-store-a', 'Barcode Store A'),
  ('00000000-0000-0000-0000-000000000212', 'barcode-store-b', 'Barcode Store B');

insert into public.store_memberships (store_id, user_id, role, status)
values
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000201', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000202', 'owner', 'active');

insert into public.product_models (id, store_id, model_code, barcode, name, brand, category, gender)
values
  ('00000000-0000-0000-0000-000000000221', '00000000-0000-0000-0000-000000000211', 'BARCODE-A', 'Shared-001', 'Model A', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000000222', '00000000-0000-0000-0000-000000000212', 'BARCODE-B', 'shared-001', 'Model B', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000000223', '00000000-0000-0000-0000-000000000211', 'BARCODE-A-SECOND', null, 'Model A second', 'Zebra', 'clothing', 'unisex');

select is(
  (select count(*) from public.product_models where lower(barcode) = 'shared-001'),
  2::bigint,
  'the same barcode is allowed in two different stores'
);

select throws_like(
  $$insert into public.product_models (store_id, model_code, barcode, name, brand, category, gender) values ('00000000-0000-0000-0000-000000000211', 'BARCODE-A-DUPLICATE', 'shared-001', 'Duplicate', 'Zebra', 'clothing', 'unisex')$$,
  '%already assigned in this store%',
  'a duplicate model barcode in the same store is rejected'
);

insert into public.product_variants (id, product_model_id, color, size, barcode)
values
  ('00000000-0000-0000-0000-000000000231', '00000000-0000-0000-0000-000000000221', 'Black', 'M', 'Variant-001'),
  ('00000000-0000-0000-0000-000000000232', '00000000-0000-0000-0000-000000000222', 'Black', 'M', 'variant-001');

select is(
  (select count(*) from public.product_variants where lower(barcode) = 'variant-001'),
  2::bigint,
  'the same variant barcode is allowed in two different stores'
);

select throws_like(
  $$insert into public.product_variants (product_model_id, color, size, barcode) values ('00000000-0000-0000-0000-000000000221', 'Red', 'S', 'SHARED-001')$$,
  '%already assigned in this store%',
  'a variant cannot claim its store model barcode'
);

select throws_like(
  $$insert into public.product_variants (product_model_id, color, size, barcode) values ('00000000-0000-0000-0000-000000000223', 'White', 'L', 'variant-001')$$,
  '%already assigned in this store%',
  'a variant cannot duplicate another model variant barcode in the same store'
);

select ok(
  to_regclass('public.product_models_store_barcode_lookup_idx') is not null
  and to_regclass('public.product_variants_barcode_lookup_idx') is not null,
  'barcode lookup indexes are installed'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
set local role authenticated;

select is(
  (select count(*) from public.product_models where lower(barcode) = 'shared-001'),
  1::bigint,
  'RLS shows an authenticated member only barcodes from their own store'
);

reset role;

select * from finish();

rollback;
