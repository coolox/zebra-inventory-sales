begin;

select plan(20);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003001', 'authenticated', 'authenticated', 'summary-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003002', 'authenticated', 'authenticated', 'summary-seller-a@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003003', 'authenticated', 'authenticated', 'summary-seller-b@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003004', 'authenticated', 'authenticated', 'summary-blocked@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003005', 'authenticated', 'authenticated', 'summary-outsider@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name, timezone) values
  ('00000000-0000-0000-0000-000000003011', 'summary-store', 'Seller Summary Store', 'Europe/Istanbul');
insert into public.store_memberships (store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003001', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003003', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003004', 'seller', 'blocked');

insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values
  ('00000000-0000-0000-0000-000000003021', '00000000-0000-0000-0000-000000003011', 'SUMMARY-A', 'Summary product', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values
  ('00000000-0000-0000-0000-000000003031', '00000000-0000-0000-0000-000000003021', 'Black', 'M');

insert into public.sales (id, store_id, seller_id, status, total_amount_eur, sold_at, cancelled_at, cancelled_by, cancellation_reason) values
  ('00000000-0000-0000-0000-000000003041', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'confirmed', 100, '2026-08-14 09:00:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003042', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003003', 'confirmed', 30, '2026-08-14 10:00:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003043', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'confirmed', 60, '2026-08-12 00:30:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003044', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'confirmed', 50, '2026-08-11 23:30:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003045', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'confirmed', 40, '2026-08-01 12:00:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003046', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'confirmed', 30, '2026-01-10 12:00:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003047', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'confirmed', 20, '2025-12-10 12:00:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003048', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003002', 'cancelled', 500, '2026-08-14 11:00:00+03', '2026-08-14 11:05:00+03', '00000000-0000-0000-0000-000000003002', 'Fixture cancellation');
insert into public.sale_lines (id, sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values
  ('00000000-0000-0000-0000-000000003051', '00000000-0000-0000-0000-000000003041', '00000000-0000-0000-0000-000000003031', 2, 50, 'EUR', 1, 50, 20),
  ('00000000-0000-0000-0000-000000003052', '00000000-0000-0000-0000-000000003042', '00000000-0000-0000-0000-000000003031', 1, 30, 'EUR', 1, 30, 10),
  ('00000000-0000-0000-0000-000000003053', '00000000-0000-0000-0000-000000003043', '00000000-0000-0000-0000-000000003031', 3, 20, 'EUR', 1, 20, 8),
  ('00000000-0000-0000-0000-000000003054', '00000000-0000-0000-0000-000000003044', '00000000-0000-0000-0000-000000003031', 7, 7.14, 'EUR', 1, 7.14, 3),
  ('00000000-0000-0000-0000-000000003055', '00000000-0000-0000-0000-000000003045', '00000000-0000-0000-0000-000000003031', 4, 10, 'EUR', 1, 10, 4),
  ('00000000-0000-0000-0000-000000003056', '00000000-0000-0000-0000-000000003046', '00000000-0000-0000-0000-000000003031', 5, 6, 'EUR', 1, 6, 2),
  ('00000000-0000-0000-0000-000000003057', '00000000-0000-0000-0000-000000003047', '00000000-0000-0000-0000-000000003031', 6, 3.33, 'EUR', 1, 3.33, 1),
  ('00000000-0000-0000-0000-000000003058', '00000000-0000-0000-0000-000000003048', '00000000-0000-0000-0000-000000003031', 9, 55.56, 'EUR', 1, 55.56, 20);
insert into public.sale_exchanges (id, store_id, source_sale_line_id, replacement_variant_id, quantity, source_unit_price_eur, replacement_unit_price, replacement_currency, replacement_eur_rate, replacement_unit_price_eur, top_up_eur, reason, exchanged_by, exchanged_at, idempotency_key) values
  ('00000000-0000-0000-0000-000000003061', '00000000-0000-0000-0000-000000003011', '00000000-0000-0000-0000-000000003051', '00000000-0000-0000-0000-000000003031', 1, 50, 60, 'EUR', 1, 60, 10, 'Summary top-up', '00000000-0000-0000-0000-000000003003', '2026-08-14 11:00:00+03', '00000000-0000-0000-0000-000000003071');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003002', false);
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'store_today'), 140::numeric, 'store today includes both Sellers and the exchange top-up');
select is((select units from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'store_today'), 3::bigint, 'store today excludes exchange replacement and cancelled sale units');
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'store_week'), 200::numeric, 'Wednesday Istanbul week includes the boundary sale and excludes Tuesday before midnight');
select is((select units from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'store_week'), 6::bigint, 'store week units reconcile confirmed lines');
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_today'), 110::numeric, 'personal today excludes another Seller and attributes source-sale exchange top-up');
select is((select units from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_today'), 2::bigint, 'personal today units are limited to current Seller');
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_week'), 170::numeric, 'personal week matches current Seller financial ledger');
select is((select units from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_week'), 5::bigint, 'personal week units match current Seller lines');
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_month'), 260::numeric, 'personal month includes pre-week August sales but excludes cancelled sale');
select is((select units from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_month'), 16::bigint, 'personal month units exclude cancelled lines');
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_year'), 290::numeric, 'personal year includes January sale');
select is((select units from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_year'), 21::bigint, 'personal year units are ledger-derived');
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_all_time'), 310::numeric, 'personal all-time includes prior year history');
select is((select units from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_all_time'), 27::bigint, 'personal all-time units include prior year history');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003003', false);
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_today'), 30::numeric, 'Seller B cannot receive Seller A personal totals');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003001', false);
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'store_today'), 140::numeric, 'Owner retains active-store aggregate access');
select is((select revenue_eur from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03') where summary_key = 'personal_all_time'), 0::numeric, 'Owner personal summary remains derived only from Owner sales');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003004', false);
select throws_like($$select * from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03')$$, '%No access to this store%', 'blocked Seller cannot read summary');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003005', false);
select throws_like($$select * from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03')$$, '%No access to this store%', 'outsider cannot read summary');
reset role;
set local role anon;
select throws_like($$select * from public.get_seller_sales_summary('00000000-0000-0000-0000-000000003011', '2026-08-14 12:00:00+03')$$, '%permission denied%', 'anonymous cannot execute summary RPC');
reset role;

select * from finish();
rollback;
