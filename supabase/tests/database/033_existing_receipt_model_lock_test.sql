begin;
select plan(5);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003401', 'authenticated', 'authenticated', 'receipt-lock-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name) values ('00000000-0000-0000-0000-000000003411', 'receipt-lock', 'Receipt Lock Store');
insert into public.store_memberships (store_id, user_id, role, status) values ('00000000-0000-0000-0000-000000003411', '00000000-0000-0000-0000-000000003401', 'owner', 'active');
insert into public.suppliers (id, store_id, name) values ('00000000-0000-0000-0000-000000003421', '00000000-0000-0000-0000-000000003411', 'Original supplier');
insert into public.product_models (id, store_id, supplier_id, model_code, barcode, name, brand, category, gender)
values ('00000000-0000-0000-0000-000000003431', '00000000-0000-0000-0000-000000003411', '00000000-0000-0000-0000-000000003421', 'LOCK-01', 'KEEP-BAR', 'Keep name', 'Keep brand', 'clothing', 'men');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003401', true);
set local role authenticated;
select is((public.confirm_inventory_receipt(
  '00000000-0000-0000-0000-000000003411',
  '{"model_code":"LOCK-01","name":"Replace","brand":"Replace","category":"shoes","gender":"women","barcode":"REPLACE-BAR","supplier_name":"Injected supplier"}'::jsonb,
  '[{"color":"Blue","size":"M","quantity":2,"unit_cost":15,"currency":"EUR"}]'::jsonb,
  '00000000-0000-0000-0000-000000003441') ->> 'variant_count')::integer, 1, 'existing model accepts only a new receipt variant');
select is((select jsonb_build_object('name', name, 'brand', brand, 'category', category, 'gender', gender, 'barcode', barcode, 'supplier_id', supplier_id) from public.product_models where id = '00000000-0000-0000-0000-000000003431'),
  '{"name":"Keep name","brand":"Keep brand","category":"clothing","gender":"men","barcode":"KEEP-BAR","supplier_id":"00000000-0000-0000-0000-000000003421"}'::jsonb, 'receipt payload cannot overwrite existing model identity');
select is((select supplier_id from public.purchase_receipts where idempotency_key = '00000000-0000-0000-0000-000000003441'), '00000000-0000-0000-0000-000000003421'::uuid, 'receipt keeps the existing model supplier');
select is((select count(*) from public.suppliers where store_id = '00000000-0000-0000-0000-000000003411' and name = 'Injected supplier'), 0::bigint, 'ignored supplier payload creates no supplier record');
select is((select count(*) from public.product_variants where product_model_id = '00000000-0000-0000-0000-000000003431' and color = 'Blue' and size = 'M'), 1::bigint, 'new color-size variant remains linked to the existing model');
reset role;
select * from finish();
rollback;
