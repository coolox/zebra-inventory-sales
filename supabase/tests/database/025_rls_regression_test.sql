begin;

-- This fixture deliberately uses three identities: an Owner and Seller in
-- Store A, plus an Owner in Store B.  Every assertion below runs as the
-- authenticated role so it exercises grants and RLS together.
select plan(23);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000701', 'authenticated', 'authenticated', 'rls-owner-a@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000702', 'authenticated', 'authenticated', 'rls-seller-a@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000703', 'authenticated', 'authenticated', 'rls-owner-b@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name) values
  ('00000000-0000-0000-0000-000000000711', 'rls-store-a', 'RLS Store A'),
  ('00000000-0000-0000-0000-000000000712', 'rls-store-b', 'RLS Store B');
insert into public.store_memberships (store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000701', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000702', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000703', 'owner', 'active');
insert into public.suppliers (id, store_id, name) values
  ('00000000-0000-0000-0000-000000000721', '00000000-0000-0000-0000-000000000711', 'RLS Supplier A'),
  ('00000000-0000-0000-0000-000000000722', '00000000-0000-0000-0000-000000000712', 'RLS Supplier B');
insert into public.product_models (id, store_id, supplier_id, model_code, name, brand, category, gender) values
  ('00000000-0000-0000-0000-000000000731', '00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000721', 'RLS-A', 'RLS model A', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000000732', '00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000722', 'RLS-B', 'RLS model B', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values
  ('00000000-0000-0000-0000-000000000741', '00000000-0000-0000-0000-000000000731', 'Black', 'M'),
  ('00000000-0000-0000-0000-000000000742', '00000000-0000-0000-0000-000000000732', 'Black', 'M');
insert into public.purchase_receipts (id, store_id, status, source, created_by, confirmed_by, confirmed_at) values
  ('00000000-0000-0000-0000-000000000751', '00000000-0000-0000-0000-000000000711', 'confirmed', 'manual', '00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000701', now()),
  ('00000000-0000-0000-0000-000000000752', '00000000-0000-0000-0000-000000000712', 'confirmed', 'manual', '00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000703', now());
insert into public.purchase_receipt_lines (receipt_id, variant_id, quantity, unit_cost, currency, eur_rate, unit_cost_eur) values
  ('00000000-0000-0000-0000-000000000751', '00000000-0000-0000-0000-000000000741', 2, 10, 'EUR', 1, 10),
  ('00000000-0000-0000-0000-000000000752', '00000000-0000-0000-0000-000000000742', 2, 10, 'EUR', 1, 10);
insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, actor_id) values
  ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000741', 'receipt', 2, '00000000-0000-0000-0000-000000000701'),
  ('00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000742', 'receipt', 2, '00000000-0000-0000-0000-000000000703');
insert into public.sales (id, store_id, seller_id) values
  ('00000000-0000-0000-0000-000000000761', '00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000702'),
  ('00000000-0000-0000-0000-000000000762', '00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000703');
insert into public.sale_lines (sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values
  ('00000000-0000-0000-0000-000000000761', '00000000-0000-0000-0000-000000000741', 1, 20, 'EUR', 1, 20, 10),
  ('00000000-0000-0000-0000-000000000762', '00000000-0000-0000-0000-000000000742', 1, 20, 'EUR', 1, 20, 10);
insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur) values
  ('00000000-0000-0000-0000-000000000761', 'cash', 20, 'EUR', 1, 20),
  ('00000000-0000-0000-0000-000000000762', 'cash', 20, 'EUR', 1, 20);
insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id) values
  ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000701', 'test.a', 'test', '00000000-0000-0000-0000-000000000731'),
  ('00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000703', 'test.b', 'test', '00000000-0000-0000-0000-000000000732');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000702', true);
set local role authenticated;
select is((select count(*) from public.stores), 1::bigint, 'Seller reads only own store');
select is((select count(*) from public.store_memberships), 2::bigint, 'Seller reads memberships only for own store');
select is((select count(*) from public.profiles), 2::bigint, 'Seller reads own and same-store profiles only');
select is((select count(*) from public.suppliers), 1::bigint, 'Seller cannot read cross-store suppliers');
select is((select count(*) from public.product_models), 1::bigint, 'Seller cannot read cross-store catalog models');
select is((select count(*) from public.product_variants), 1::bigint, 'Seller cannot read cross-store variants');
select is((select count(*) from public.purchase_receipts), 1::bigint, 'Seller cannot read cross-store receipts');
select is((select count(*) from public.purchase_receipt_lines), 1::bigint, 'Seller cannot read cross-store receipt lines');
select is((select count(*) from public.inventory_movements), 1::bigint, 'Seller cannot read cross-store inventory movements');
select is((select count(*) from public.sales), 1::bigint, 'Seller cannot read cross-store sales');
select is((select count(*) from public.sale_lines), 1::bigint, 'Seller cannot read cross-store sale lines');
select is((select count(*) from public.sale_payments), 1::bigint, 'Seller cannot read cross-store payments');
select is((select count(*) from public.audit_logs), 0::bigint, 'Seller cannot read owner audit log');
select throws_like($$insert into public.product_models (store_id, model_code, name, brand, category, gender) values ('00000000-0000-0000-0000-000000000711', 'NO-WRITE', 'No write', 'Zebra', 'clothing', 'unisex')$$, '%permission denied%', 'Seller cannot directly write catalog rows');
select throws_like($$insert into public.inventory_movements (store_id, variant_id, movement_type, quantity) values ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000741', 'adjustment', 1)$$, '%permission denied%', 'Seller cannot directly write inventory movements');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000701', true);
set local role authenticated;
select is((select count(*) from public.audit_logs), 1::bigint, 'Owner reads only own-store audit log');
select is((select count(*) from public.sales), 1::bigint, 'Owner cannot read another store sales');
select is((select count(*) from public.sale_payments), 1::bigint, 'Owner cannot read another store payments');
select is((select count(*) from public.inventory_movements), 1::bigint, 'Owner cannot read another store inventory');
select throws_like($$insert into public.audit_logs (store_id, action, entity_type) values ('00000000-0000-0000-0000-000000000711', 'bad.write', 'test')$$, '%permission denied%', 'Owner cannot directly write audit rows');
reset role;

set local role anon;
select throws_like($$select count(*) from public.stores$$, '%permission denied%', 'Anonymous access cannot read stores');
select throws_like($$select count(*) from public.product_models$$, '%permission denied%', 'Anonymous access cannot read catalog');
select throws_like($$select public.confirm_sale_with_payments('00000000-0000-0000-0000-000000000711', '[]'::jsonb, '[]'::jsonb, gen_random_uuid())$$, '%permission denied%', 'Anonymous access cannot execute sale RPC');
reset role;

select * from finish();
rollback;
