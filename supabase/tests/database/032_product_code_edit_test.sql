begin;

select plan(11);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003201', 'authenticated', 'authenticated', 'code-edit-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003202', 'authenticated', 'authenticated', 'code-edit-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003203', 'authenticated', 'authenticated', 'code-edit-other-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name)
values
  ('00000000-0000-0000-0000-000000003211', 'code-edit', 'Code Edit Store'),
  ('00000000-0000-0000-0000-000000003212', 'code-edit-other', 'Code Edit Other Store');

insert into public.store_memberships (store_id, user_id, role, status)
values
  ('00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003201', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003202', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000003212', '00000000-0000-0000-0000-000000003203', 'owner', 'active');

insert into public.product_models (id, store_id, model_code, name, brand, category, gender, barcode)
values
  ('00000000-0000-0000-0000-000000003221', '00000000-0000-0000-0000-000000003211', '0007-AZ', 'Correctable model', 'Zebra', 'clothing', 'unisex', 'BAR-KEEP'),
  ('00000000-0000-0000-0000-000000003222', '00000000-0000-0000-0000-000000003211', 'TAKEN-01', 'Existing model', 'Zebra', 'clothing', 'unisex', 'BAR-OTHER');

insert into public.product_variants (id, product_model_id, color, size)
values ('00000000-0000-0000-0000-000000003231', '00000000-0000-0000-0000-000000003221', 'Black', 'M');

insert into public.inventory_movements (id, store_id, variant_id, movement_type, quantity, occurred_at, reason)
values ('00000000-0000-0000-0000-000000003241', '00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003231', 'receipt', 4, now(), 'history remains linked');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003202', true);
set local role authenticated;
select throws_like(
  $$select public.update_product_model_code('00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003221', '0008-AZ')$$,
  '%Only an Owner%',
  'a Seller cannot edit a product code'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003203', true);
set local role authenticated;
select throws_like(
  $$select public.update_product_model_code('00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003221', '0008-AZ')$$,
  '%Only an Owner%',
  'an Owner from another store cannot edit a product code'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003201', true);
set local role authenticated;
select throws_like(
  $$select public.update_product_model_code('00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003221', 'TAKEN-01')$$,
  '%already used%',
  'an Owner cannot overwrite another model code'
);
select throws_like(
  $$select public.update_product_model_code('00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003221', '   ')$$,
  '%non-empty%',
  'a blank product code is rejected'
);
select is(
  (select model_code from public.update_product_model_code('00000000-0000-0000-0000-000000003211', '00000000-0000-0000-0000-000000003221', '  0010-AZ  ')),
  '0010-AZ',
  'Owner corrects code while preserving leading zeroes and letters'
);
select is((select id from public.product_models where id = '00000000-0000-0000-0000-000000003221'), '00000000-0000-0000-0000-000000003221'::uuid, 'model UUID remains unchanged');
select is((select product_model_id from public.product_variants where id = '00000000-0000-0000-0000-000000003231'), '00000000-0000-0000-0000-000000003221'::uuid, 'variant remains linked to the same model UUID');
select is((select count(*) from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000003231'), 1::bigint, 'inventory history remains linked to the same variant UUID');
select is((select barcode from public.product_models where id = '00000000-0000-0000-0000-000000003221'), 'BAR-KEEP', 'barcode is unchanged');
select is((select details ->> 'old_model_code' from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000003221' and action = 'product_model.code_updated'), '0007-AZ', 'audit stores the old code');
select is((select details ->> 'new_model_code' from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000003221' and action = 'product_model.code_updated'), '0010-AZ', 'audit stores the new code');
reset role;

select * from finish();
rollback;
