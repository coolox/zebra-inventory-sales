begin;

select plan(8);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003601', 'authenticated', 'authenticated', 'details-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003602', 'authenticated', 'authenticated', 'details-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003603', 'authenticated', 'authenticated', 'details-other-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name) values
  ('00000000-0000-0000-0000-000000003611', 'details', 'Details Store'),
  ('00000000-0000-0000-0000-000000003612', 'details-other', 'Details Other Store');
insert into public.store_memberships (store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000003611', '00000000-0000-0000-0000-000000003601', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000003611', '00000000-0000-0000-0000-000000003602', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000003612', '00000000-0000-0000-0000-000000003603', 'owner', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender, low_stock_threshold, current_purchase_cost, current_purchase_currency, current_purchase_cost_eur)
values ('00000000-0000-0000-0000-000000003621', '00000000-0000-0000-0000-000000003611', 'DETAIL-01', 'Original dress', 'Zebra', 'clothing', 'women', 2, 40, 'EUR', 40);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003602', true);
set local role authenticated;
select throws_like($$select public.update_product_model_details('00000000-0000-0000-0000-000000003611', '00000000-0000-0000-0000-000000003621', 'Changed', 'unisex', 3, 55, 'USD', 50)$$, '%Only an Owner%', 'Seller cannot edit model details');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003603', true);
set local role authenticated;
select throws_like($$select public.update_product_model_details('00000000-0000-0000-0000-000000003611', '00000000-0000-0000-0000-000000003621', 'Changed', 'unisex', 3, 55, 'USD', 50)$$, '%Only an Owner%', 'Cross-store Owner cannot edit model details');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003601', true);
set local role authenticated;
select is((select name from public.update_product_model_details('00000000-0000-0000-0000-000000003611', '00000000-0000-0000-0000-000000003621', '  Evening dress  ', 'unisex', 3, 55, 'USD', 50)), 'Evening dress', 'Owner updates a trimmed model name');
select is((select jsonb_build_object('gender', gender, 'threshold', low_stock_threshold, 'cost', current_purchase_cost, 'currency', current_purchase_currency, 'cost_eur', current_purchase_cost_eur) from public.product_models where id = '00000000-0000-0000-0000-000000003621'), '{"cost":55,"cost_eur":50,"currency":"USD","gender":"unisex","threshold":3}'::jsonb, 'Current model fields update together for future operations');
select is((select model_code from public.product_models where id = '00000000-0000-0000-0000-000000003621'), 'DETAIL-01', 'Product identity remains unchanged');
select is((select details ->> 'old_purchase_cost' from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000003621' and action = 'product_model.details_updated'), '40.00', 'Audit records the old purchase cost');
select is((select details ->> 'new_purchase_cost' from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000003621' and action = 'product_model.details_updated'), '55.00', 'Audit records the new purchase cost');
select is((select details ->> 'old_name' from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000003621' and action = 'product_model.details_updated'), 'Original dress', 'Audit records the previous model name');
reset role;

select * from finish();
rollback;
