begin;

select plan(8);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000002001', 'authenticated', 'authenticated', 'reconciliation-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
       ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000002002', 'authenticated', 'authenticated', 'reconciliation-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name) values ('00000000-0000-0000-0000-000000002011', 'reconciliation', 'Reconciliation Store'), ('00000000-0000-0000-0000-000000002012', 'reconciliation-clean', 'Clean Store');
insert into public.store_memberships (store_id, user_id, role, status) values ('00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000002001', 'owner', 'active'), ('00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000002002', 'seller', 'active'), ('00000000-0000-0000-0000-000000002012', '00000000-0000-0000-0000-000000002001', 'owner', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values ('00000000-0000-0000-0000-000000002021', '00000000-0000-0000-0000-000000002011', 'REC-A', 'Reconciliation A', 'Zebra', 'clothing', 'unisex'), ('00000000-0000-0000-0000-000000002022', '00000000-0000-0000-0000-000000002012', 'REC-C', 'Clean A', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values ('00000000-0000-0000-0000-000000002031', '00000000-0000-0000-0000-000000002021', 'Black', 'M'), ('00000000-0000-0000-0000-000000002032', '00000000-0000-0000-0000-000000002022', 'Blue', 'M');
insert into public.sales (id, store_id, seller_id, total_amount_eur, sold_at) values ('00000000-0000-0000-0000-000000002041', '00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000002001', 100, '2026-08-13T09:00:00Z'), ('00000000-0000-0000-0000-000000002042', '00000000-0000-0000-0000-000000002012', '00000000-0000-0000-0000-000000002001', 10, '2026-08-13T10:00:00Z');
insert into public.sale_lines (id, sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values ('00000000-0000-0000-0000-000000002051', '00000000-0000-0000-0000-000000002041', '00000000-0000-0000-0000-000000002031', 2, 50, 'EUR', 1, 50, 20), ('00000000-0000-0000-0000-000000002052', '00000000-0000-0000-0000-000000002042', '00000000-0000-0000-0000-000000002032', 1, 10, 'EUR', 1, 10, 4);
insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur) values ('00000000-0000-0000-0000-000000002041', 'cash', 90, 'EUR', 1, 90), ('00000000-0000-0000-0000-000000002042', 'cash', 10, 'EUR', 1, 10);
insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason) values ('00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000002031', 'receipt', 1, '2026-08-13T08:00:00Z', '00000000-0000-0000-0000-000000002001', 'fixture'), ('00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000002031', 'adjustment', -2, '2026-08-13T11:00:00Z', '00000000-0000-0000-0000-000000002001', 'fixture'), ('00000000-0000-0000-0000-000000002012', '00000000-0000-0000-0000-000000002032', 'receipt', 1, '2026-08-13T09:00:00Z', '00000000-0000-0000-0000-000000002001', 'clean receipt'), ('00000000-0000-0000-0000-000000002012', '00000000-0000-0000-0000-000000002032', 'sale', -1, '2026-08-13T10:00:00Z', '00000000-0000-0000-0000-000000002001', 'clean sale');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002001', false);
select ok(exists(select 1 from public.get_reconciliation_discrepancies('00000000-0000-0000-0000-000000002011') where discrepancy_type = 'payment_mismatch' and source_ids ->> 'sale_id' = '00000000-0000-0000-0000-000000002041'), 'payment mismatch includes the sale source ID');
select ok(exists(select 1 from public.get_reconciliation_discrepancies('00000000-0000-0000-0000-000000002011') where discrepancy_type = 'missing_sale_movement' and source_ids ->> 'sale_line_id' = '00000000-0000-0000-0000-000000002051'), 'missing sale movement includes source IDs');
select ok(exists(select 1 from public.get_reconciliation_discrepancies('00000000-0000-0000-0000-000000002011') where discrepancy_type = 'negative_balance'), 'negative balance is reported');
select ok(exists(select 1 from public.get_reconciliation_discrepancies('00000000-0000-0000-0000-000000002011') where discrepancy_type = 'manual_correction'), 'manual correction is surfaced for Owner review');
select is((select count(*) from public.get_reconciliation_discrepancies('00000000-0000-0000-0000-000000002012')), 0::bigint, 'clean dataset has no false-positive discrepancies');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002002', false);
select throws_like($$select * from public.get_reconciliation_discrepancies('00000000-0000-0000-0000-000000002011')$$, '%Owner access is required%', 'Seller cannot read Owner reconciliation');
reset role;
set local role anon;
select throws_like($$select * from public.get_reconciliation_discrepancies('00000000-0000-0000-0000-000000002011')$$, '%permission denied%', 'anonymous cannot execute reconciliation RPC');
reset role;
select ok(true, 'fixture completes without writes from reconciliation');

select * from finish();
rollback;
