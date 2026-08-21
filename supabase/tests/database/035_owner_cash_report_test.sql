begin;

select plan(4);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003501', 'authenticated', 'authenticated', 'cash-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003502', 'authenticated', 'authenticated', 'cash-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name, timezone) values ('00000000-0000-0000-0000-000000003511', 'cash-report', 'Cash Report Store', 'Europe/Istanbul');
insert into public.store_memberships (store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000003511', '00000000-0000-0000-0000-000000003501', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000003511', '00000000-0000-0000-0000-000000003502', 'seller', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values ('00000000-0000-0000-0000-000000003521', '00000000-0000-0000-0000-000000003511', 'CASH-01', 'Cash product', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values ('00000000-0000-0000-0000-000000003531', '00000000-0000-0000-0000-000000003521', 'Black', 'M');
insert into public.sales (id, store_id, seller_id, status, total_amount_eur, sold_at, cancelled_at, cancelled_by, cancellation_reason) values
  ('00000000-0000-0000-0000-000000003541', '00000000-0000-0000-0000-000000003511', '00000000-0000-0000-0000-000000003501', 'confirmed', 130, '2026-08-21 10:00:00+03', null, null, null),
  ('00000000-0000-0000-0000-000000003542', '00000000-0000-0000-0000-000000003511', '00000000-0000-0000-0000-000000003501', 'cancelled', 20, '2026-08-21 11:00:00+03', '2026-08-21 11:01:00+03', '00000000-0000-0000-0000-000000003501', 'Test cancellation');
insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur, status, reversed_at, reversed_by) values
  ('00000000-0000-0000-0000-000000003541', 'cash', 100, 'EUR', 1, 100, 'captured', null, null),
  ('00000000-0000-0000-0000-000000003541', 'bank_transfer', 30, 'USD', 0.9, 27, 'captured', null, null),
  ('00000000-0000-0000-0000-000000003542', 'cash', 20, 'EUR', 1, 20, 'reversed', '2026-08-21 11:01:00+03', '00000000-0000-0000-0000-000000003501');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003501', false);
set local role authenticated;
select is((select amount from public.owner_cash_report('00000000-0000-0000-0000-000000003511', '2026-08-21', '2026-08-21') where payment_method = 'cash' and currency = 'EUR'), 100::numeric, 'Owner gets captured cash in its original currency');
select is((select amount from public.owner_cash_report('00000000-0000-0000-0000-000000003511', '2026-08-21', '2026-08-21') where payment_method = 'bank_transfer' and currency = 'USD'), 30::numeric, 'Owner gets transfer in its original currency');
select is((select count(*) from public.owner_cash_report('00000000-0000-0000-0000-000000003511', '2026-08-21', '2026-08-21')), 2::bigint, 'Cancelled and reversed sale payment is excluded');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003502', false);
select throws_like($$select * from public.owner_cash_report('00000000-0000-0000-0000-000000003511', '2026-08-21', '2026-08-21')$$, '%Only an Owner can view Cash reports%', 'Seller cannot read the store cash report');
reset role;

select * from finish();
rollback;
