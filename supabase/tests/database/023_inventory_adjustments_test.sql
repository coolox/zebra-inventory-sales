begin;

select plan(7);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000501', 'authenticated', 'authenticated', 'adjustment-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000502', 'authenticated', 'authenticated', 'adjustment-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name) values ('00000000-0000-0000-0000-000000000511', 'adjustment-store', 'Adjustment Store');
insert into public.store_memberships (store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000501', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000502', 'seller', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values ('00000000-0000-0000-0000-000000000521', '00000000-0000-0000-0000-000000000511', 'ADJUST-01', 'Adjustment Model', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values ('00000000-0000-0000-0000-000000000531', '00000000-0000-0000-0000-000000000521', 'Black', 'M');
insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, reason) values ('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000531', 'receipt', 3, 'Opening stock');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);
set local role authenticated;
select is((select quantity from public.confirm_inventory_adjustment('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000531', -1, 'Count correction', '00000000-0000-0000-0000-000000000541')), -1, 'Owner creates a signed adjustment movement');
select is((select coalesce(sum(quantity), 0) from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000531'), 2::bigint, 'adjustment changes balance through the ledger only');
select is((select count(*) from public.audit_logs where action = 'inventory.adjusted' and entity_type = 'inventory_movement'), 1::bigint, 'adjustment has one audit record');
select is((select id from public.confirm_inventory_adjustment('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000531', -1, 'Count correction', '00000000-0000-0000-0000-000000000541')), (select id from public.inventory_movements where store_id = '00000000-0000-0000-0000-000000000511' and idempotency_key = '00000000-0000-0000-0000-000000000541'), 'retry returns the original movement');
select is((select count(*) from public.audit_logs where action = 'inventory.adjusted'), 1::bigint, 'retry does not duplicate audit record');
select throws_like($$select public.confirm_inventory_adjustment('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000531', -3, 'Too far', '00000000-0000-0000-0000-000000000542')$$, '%negative%', 'negative stock rolls back the adjustment');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);
set local role authenticated;
select throws_like($$select public.confirm_inventory_adjustment('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000531', 1, 'Not allowed', '00000000-0000-0000-0000-000000000543')$$, '%Only an Owner%', 'Seller cannot adjust inventory');
reset role;

select * from finish();
rollback;
