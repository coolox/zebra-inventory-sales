begin;

select plan(20);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000001001', 'authenticated', 'authenticated', 'report-member@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000001002', 'authenticated', 'authenticated', 'report-outsider@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name) values
  ('00000000-0000-0000-0000-000000001011', 'report-store', 'Reporting Test Store'),
  ('00000000-0000-0000-0000-000000001012', 'report-other', 'Other Reporting Store'),
  ('00000000-0000-0000-0000-000000001013', 'report-empty', 'Empty Reporting Store');
insert into public.store_memberships (store_id, user_id, role, status)
values
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001001', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000001013', '00000000-0000-0000-0000-000000001001', 'seller', 'active');

insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values
  ('00000000-0000-0000-0000-000000001021', '00000000-0000-0000-0000-000000001011', 'REPORT-A', 'Report A', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000001022', '00000000-0000-0000-0000-000000001011', 'REPORT-B', 'Report B', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000001023', '00000000-0000-0000-0000-000000001012', 'REPORT-C', 'Report C', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values
  ('00000000-0000-0000-0000-000000001031', '00000000-0000-0000-0000-000000001021', 'Black', 'M'),
  ('00000000-0000-0000-0000-000000001032', '00000000-0000-0000-0000-000000001021', 'Blue', 'M'),
  ('00000000-0000-0000-0000-000000001033', '00000000-0000-0000-0000-000000001022', 'Green', 'M'),
  ('00000000-0000-0000-0000-000000001034', '00000000-0000-0000-0000-000000001023', 'White', 'M');

insert into public.sales (id, store_id, seller_id, status, total_amount_eur, cancelled_at, cancelled_by, cancellation_reason) values
  ('00000000-0000-0000-0000-000000001041', '00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001001', 'confirmed', 100, null, null, null),
  ('00000000-0000-0000-0000-000000001042', '00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001001', 'confirmed', 60, null, null, null),
  ('00000000-0000-0000-0000-000000001043', '00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001001', 'cancelled', 50, now(), '00000000-0000-0000-0000-000000001001', 'Fixture cancellation'),
  ('00000000-0000-0000-0000-000000001044', '00000000-0000-0000-0000-000000001012', '00000000-0000-0000-0000-000000001002', 'confirmed', 500, null, null, null);
insert into public.sale_lines (id, sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values
  ('00000000-0000-0000-0000-000000001051', '00000000-0000-0000-0000-000000001041', '00000000-0000-0000-0000-000000001031', 2, 50, 'EUR', 1, 50, 30),
  ('00000000-0000-0000-0000-000000001052', '00000000-0000-0000-0000-000000001042', '00000000-0000-0000-0000-000000001032', 3, 20, 'EUR', 1, 20, 10),
  ('00000000-0000-0000-0000-000000001053', '00000000-0000-0000-0000-000000001043', '00000000-0000-0000-0000-000000001033', 1, 50, 'EUR', 1, 50, 20),
  ('00000000-0000-0000-0000-000000001054', '00000000-0000-0000-0000-000000001044', '00000000-0000-0000-0000-000000001034', 1, 500, 'EUR', 1, 500, 100);

insert into public.sale_exchanges (id, store_id, source_sale_line_id, replacement_variant_id, quantity, source_unit_price_eur, replacement_unit_price, replacement_currency, replacement_eur_rate, replacement_unit_price_eur, top_up_eur, reason, exchanged_by, idempotency_key) values
  ('00000000-0000-0000-0000-000000001061', '00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001051', '00000000-0000-0000-0000-000000001032', 1, 50, 70, 'EUR', 1, 70, 20, 'Larger size', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000001071'),
  ('00000000-0000-0000-0000-000000001062', '00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001053', '00000000-0000-0000-0000-000000001031', 1, 50, 149, 'EUR', 1, 149, 99, 'Cancelled source', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000001072');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000001001', false);
select is((select revenue_eur from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')), 180::numeric, 'confirmed sale snapshots plus only confirmed-source exchange top-up form revenue');
select is((select cost_eur from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')), 90::numeric, 'cost reconciles to confirmed sale-line EUR snapshots');
select is((select margin_eur from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')), 90::numeric, 'margin is EUR revenue less EUR cost');
select is((select sale_count from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')), 2::bigint, 'exchange does not become a second sale ticket');
select is((select units from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')), 5::bigint, 'cancelled sale lines and exchange replacement do not change sold units');
select is((select average_ticket_eur from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')), 90::numeric, 'average ticket uses confirmed sale count and EUR turnover');
select is((select revenue_eur from public.get_reporting_metrics('00000000-0000-0000-0000-000000001013', '2000-01-01', '2100-01-01')), 0::numeric, 'accessible empty store returns zero EUR metrics');

select is((select sum(revenue_eur) from public.get_reporting_breakdown('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01', 'seller')), 180::numeric, 'seller breakdown reconciles revenue including exchange top-up');
select is((select sum(cost_eur) from public.get_reporting_breakdown('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01', 'supplier')), 90::numeric, 'supplier breakdown reconciles cost for unassigned suppliers');
select is((select sum(margin_eur) from public.get_reporting_breakdown('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01', 'brand')), 90::numeric, 'brand breakdown reconciles margin');
select is((select sum(units)::bigint from public.get_reporting_breakdown('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01', 'category')), 5::bigint, 'category breakdown reconciles sold units');
update public.product_models set is_active = false where id = '00000000-0000-0000-0000-000000001021';
select is((select revenue_eur from public.get_reporting_breakdown('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01', 'model') where dimension_key = '00000000-0000-0000-0000-000000001021'), 180::numeric, 'archived model remains in reporting history');
select throws_like($$select * from public.get_reporting_breakdown('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01', 'color')$$, '%Unknown reporting dimension%', 'unknown dimension is rejected');

insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason) values
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001031', 'receipt', 5, now(), '00000000-0000-0000-0000-000000001001', 'report receipt'),
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001031', 'adjustment', -2, now(), '00000000-0000-0000-0000-000000001001', 'report reconciliation'),
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001032', 'receipt', 3, now(), '00000000-0000-0000-0000-000000001001', 'report receipt'),
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001032', 'adjustment', -3, now(), '00000000-0000-0000-0000-000000001001', 'report reconciliation');
select is((select balance from public.get_inventory_report('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01') where variant_id = '00000000-0000-0000-0000-000000001031'), 3, 'variant balance reconciles exactly with inventory movement ledger');
select is((select sell_through from public.get_inventory_report('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01') where variant_id = '00000000-0000-0000-0000-000000001031'), .4::numeric, 'sell-through uses sold units and closing balance');
select ok((select is_low_stock from public.get_inventory_report('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01') where variant_id = '00000000-0000-0000-0000-000000001032'), 'configured/default threshold identifies zero balance as low stock');
select is((select turnover from public.get_inventory_report('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01') where variant_id = '00000000-0000-0000-0000-000000001033'), 0::numeric, 'zero sales and zero balance avoid division by zero');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000001002', false);
select throws_like($$select * from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')$$, '%No access to this store%', 'outsider cannot read reporting metrics');
select throws_like($$select * from public.get_reporting_breakdown('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01', 'seller')$$, '%No access to this store%', 'outsider cannot read reporting breakdowns');

reset role;
set local role anon;
select throws_like($$select * from public.get_reporting_metrics('00000000-0000-0000-0000-000000001011', '2000-01-01', '2100-01-01')$$, '%permission denied%', 'anonymous cannot execute reporting RPC');
reset role;

select * from finish();
rollback;
