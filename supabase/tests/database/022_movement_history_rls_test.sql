begin;

select plan(3);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000401', 'authenticated', 'authenticated', 'movement-member@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000402', 'authenticated', 'authenticated', 'movement-outsider@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name)
values ('00000000-0000-0000-0000-000000000411', 'movement-store', 'Movement Store');
insert into public.store_memberships (store_id, user_id, role, status)
values ('00000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000401', 'seller', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender)
values ('00000000-0000-0000-0000-000000000421', '00000000-0000-0000-0000-000000000411', 'MOVEMENT-01', 'Movement Model', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size)
values ('00000000-0000-0000-0000-000000000431', '00000000-0000-0000-0000-000000000421', 'Black', 'M');
insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, actor_id, reason)
values ('00000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000431', 'receipt', 2, '00000000-0000-0000-0000-000000000401', 'Receipt');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000401', true);
set local role authenticated;
select is((select count(*) from public.inventory_movements where store_id = '00000000-0000-0000-0000-000000000411' and variant_id = '00000000-0000-0000-0000-000000000431'), 1::bigint, 'an active store member reads the selected variant movement history');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000402', true);
set local role authenticated;
select is((select count(*) from public.inventory_movements where store_id = '00000000-0000-0000-0000-000000000411'), 0::bigint, 'an outsider cannot read another store movement history');
reset role;

select ok(to_regclass('public.inventory_movements') is not null, 'movement history uses the audited inventory movements ledger');

select * from finish();
rollback;
