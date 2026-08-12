begin;

select plan(8);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000301', 'authenticated', 'authenticated', 'archive-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000302', 'authenticated', 'authenticated', 'archive-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000303', 'authenticated', 'authenticated', 'archive-other-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name)
values
  ('00000000-0000-0000-0000-000000000311', 'archive-store', 'Archive Store'),
  ('00000000-0000-0000-0000-000000000312', 'archive-other-store', 'Archive Other Store');

insert into public.store_memberships (store_id, user_id, role, status)
values
  ('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000301', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000302', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000303', 'owner', 'active');

insert into public.product_models (id, store_id, model_code, name, brand, category, gender)
values ('00000000-0000-0000-0000-000000000321', '00000000-0000-0000-0000-000000000311', 'ARCHIVE-01', 'Archive model', 'Zebra', 'clothing', 'unisex');

insert into public.product_variants (id, product_model_id, color, size)
values ('00000000-0000-0000-0000-000000000331', '00000000-0000-0000-0000-000000000321', 'Black', 'M');

select is((select is_active from public.product_models where id = '00000000-0000-0000-0000-000000000321'), true, 'the new model starts active');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000302', true);
set local role authenticated;
select throws_like(
  $$select public.set_product_model_archived('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000321', true)$$,
  '%Only an Owner%',
  'a Seller cannot archive a model'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000303', true);
set local role authenticated;
select throws_like(
  $$select public.set_product_model_archived('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000321', true)$$,
  '%Only an Owner%',
  'an Owner from another store cannot archive the model'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000301', true);
set local role authenticated;
select is((select is_active from public.set_product_model_archived('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000321', true)), false, 'the store Owner archives a model');
select is((select count(*) from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000000321' and action = 'product_model.archived'), 1::bigint, 'archiving writes one audit record');
reset role;
select throws_like(
  $$insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, reason) values ('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000331', 'sale', -1, now(), 'test')$$,
  '%Archived or inactive products cannot be sold%',
  'an archived model cannot be sold by a stale client request'
);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000301', true);
set local role authenticated;
select is((select is_active from public.set_product_model_archived('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000321', false)), true, 'the store Owner restores a model');
select is((select count(*) from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000000321' and action = 'product_model.restored'), 1::bigint, 'restoring writes one audit record');
reset role;

select * from finish();

rollback;
