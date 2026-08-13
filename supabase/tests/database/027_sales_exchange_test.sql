begin;

select plan(17);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000901', 'authenticated', 'authenticated', 'exchange-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000902', 'authenticated', 'authenticated', 'exchange-outsider@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name) values ('00000000-0000-0000-0000-000000000911', 'exchange-store', 'Exchange Test Store');
insert into public.store_memberships (store_id, user_id, role, status) values ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000901', 'seller', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values
  ('00000000-0000-0000-0000-000000000921', '00000000-0000-0000-0000-000000000911', 'EX-EXP', 'Expensive source', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000000922', '00000000-0000-0000-0000-000000000911', 'EX-EQL', 'Equal source', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000000923', '00000000-0000-0000-0000-000000000911', 'EX-CHP', 'Cheap source', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000000924', '00000000-0000-0000-0000-000000000911', 'EX-LOW', 'No-stock source', 'Zebra', 'clothing', 'unisex'),
  ('00000000-0000-0000-0000-000000000925', '00000000-0000-0000-0000-000000000911', 'EX-NEW', 'Replacement', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values
  ('00000000-0000-0000-0000-000000000931', '00000000-0000-0000-0000-000000000921', 'Black', 'M'),
  ('00000000-0000-0000-0000-000000000932', '00000000-0000-0000-0000-000000000922', 'Blue', 'M'),
  ('00000000-0000-0000-0000-000000000933', '00000000-0000-0000-0000-000000000923', 'Red', 'M'),
  ('00000000-0000-0000-0000-000000000934', '00000000-0000-0000-0000-000000000924', 'White', 'M'),
  ('00000000-0000-0000-0000-000000000935', '00000000-0000-0000-0000-000000000925', 'Green', 'M'),
  ('00000000-0000-0000-0000-000000000936', '00000000-0000-0000-0000-000000000925', 'Yellow', 'M'),
  ('00000000-0000-0000-0000-000000000937', '00000000-0000-0000-0000-000000000925', 'Purple', 'M'),
  ('00000000-0000-0000-0000-000000000938', '00000000-0000-0000-0000-000000000925', 'Orange', 'M');
insert into public.sales (id, store_id, seller_id, total_amount_eur) values
  ('00000000-0000-0000-0000-000000000941', '00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000901', 100),
  ('00000000-0000-0000-0000-000000000942', '00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000901', 80),
  ('00000000-0000-0000-0000-000000000943', '00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000901', 240),
  ('00000000-0000-0000-0000-000000000944', '00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000901', 100);
insert into public.sale_lines (id, sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values
  ('00000000-0000-0000-0000-000000000951', '00000000-0000-0000-0000-000000000941', '00000000-0000-0000-0000-000000000931', 1, 100, 'EUR', 1, 100, 50),
  ('00000000-0000-0000-0000-000000000952', '00000000-0000-0000-0000-000000000942', '00000000-0000-0000-0000-000000000932', 1, 80, 'EUR', 1, 80, 40),
  ('00000000-0000-0000-0000-000000000953', '00000000-0000-0000-0000-000000000943', '00000000-0000-0000-0000-000000000933', 2, 120, 'EUR', 1, 120, 60),
  ('00000000-0000-0000-0000-000000000954', '00000000-0000-0000-0000-000000000944', '00000000-0000-0000-0000-000000000934', 1, 100, 'EUR', 1, 100, 50);
insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, actor_id, reason) values
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000931', 'sale', -1, '00000000-0000-0000-0000-000000000901', 'fixture sold'),
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000932', 'sale', -1, '00000000-0000-0000-0000-000000000901', 'fixture sold'),
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000933', 'sale', -2, '00000000-0000-0000-0000-000000000901', 'fixture sold'),
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000934', 'sale', -1, '00000000-0000-0000-0000-000000000901', 'fixture sold'),
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000935', 'receipt', 2, '00000000-0000-0000-0000-000000000901', 'fixture stock'),
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000936', 'receipt', 2, '00000000-0000-0000-0000-000000000901', 'fixture stock'),
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000937', 'receipt', 2, '00000000-0000-0000-0000-000000000901', 'fixture stock');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000901', false);
select ok((public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000951', '00000000-0000-0000-0000-000000000935', 1, 130::numeric, 'EUR', '[{"method":"card","amount":30,"currency":"EUR"}]'::jsonb, 'Too small', '00000000-0000-0000-0000-000000000961', '2026-08-13 12:00:00+00') ->> 'top_up_eur')::numeric = 30, 'expensive exchange requires exact EUR top-up');
select is((select coalesce(sum(quantity), 0)::bigint from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000931'), 0::bigint, 'expensive exchange restores returned stock');
select is((select coalesce(sum(quantity), 0)::bigint from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000935'), 1::bigint, 'expensive exchange deducts replacement stock');
select ok(exists (select 1 from public.sale_exchange_payments where amount = 30 and currency = 'EUR' and amount_eur = 30), 'top-up preserves native payment snapshot');
select ok(exists (select 1 from public.audit_logs where action = 'sale.exchanged' and details ->> 'reason' = 'Too small'), 'exchange writes reasoned audit record');

select ok((public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000952', '00000000-0000-0000-0000-000000000936', 1, 80::numeric, 'EUR', '[]'::jsonb, 'Different color', '00000000-0000-0000-0000-000000000962', '2026-08-13 12:00:00+00') ->> 'top_up_eur')::numeric = 0, 'equal exchange needs no payment');
select is((select count(*)::bigint from public.sale_exchange_payments), 1::bigint, 'equal exchange creates no payment line');
select ok((public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000953', '00000000-0000-0000-0000-000000000937', 1, 70::numeric, 'EUR', '[]'::jsonb, 'Lower price size', '00000000-0000-0000-0000-000000000963', '2026-08-13 12:00:00+00') ->> 'top_up_eur')::numeric = 0, 'cheaper exchange creates no customer credit');
select is((select count(*)::bigint from public.sale_exchange_payments), 1::bigint, 'cheaper exchange creates neither payment nor refund line');
select throws_like($$select public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000953', '00000000-0000-0000-0000-000000000937', 1, 70::numeric, 'EUR', '[{"method":"cash","amount":1,"currency":"EUR"}]'::jsonb, 'No credit', '00000000-0000-0000-0000-000000000964', '2026-08-13 12:00:00+00')$$, '%cannot create a payment, credit or refund%', 'cheaper exchange rejects a payment/credit');
select throws_like($$select public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000954', '00000000-0000-0000-0000-000000000938', 1, 120::numeric, 'EUR', '[{"method":"cash","amount":20,"currency":"EUR"}]'::jsonb, 'No stock', '00000000-0000-0000-0000-000000000965', '2026-08-13 12:00:00+00')$$, '%Insufficient stock%', 'insufficient replacement stock rolls back exchange');
select is((select coalesce(sum(quantity), 0)::bigint from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000934'), (-1)::bigint, 'failed exchange does not restore source stock');
select ok((public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000951', '00000000-0000-0000-0000-000000000935', 1, 130::numeric, 'EUR', '[{"method":"card","amount":30,"currency":"EUR"}]'::jsonb, 'Retry', '00000000-0000-0000-0000-000000000961', '2026-08-13 12:00:00+00') ->> 'idempotent_replay')::boolean, 'same exchange idempotency key replays');
select is((select count(*)::bigint from public.sale_exchanges), 3::bigint, 'replay cannot create a duplicate exchange');
select throws_like($$select public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000951', '00000000-0000-0000-0000-000000000935', 1, 130::numeric, 'EUR', '[]'::jsonb, ' ', '00000000-0000-0000-0000-000000000966', '2026-08-13 12:00:00+00')$$, '%reason and idempotency key are required%', 'reason remains mandatory');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000902', false);
select throws_like($$select public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000951', '00000000-0000-0000-0000-000000000935', 1, 130::numeric, 'EUR', '[]'::jsonb, 'Outsider', '00000000-0000-0000-0000-000000000967', '2026-08-13 12:00:00+00')$$, '%No access%', 'outsider cannot exchange another store sale');
reset role;
set local role anon;
select throws_like($$select public.exchange_sale_line('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000951', '00000000-0000-0000-0000-000000000935', 1, 130::numeric, 'EUR', '[]'::jsonb, 'Anonymous', '00000000-0000-0000-0000-000000000968', '2026-08-13 12:00:00+00')$$, '%permission denied%', 'anonymous cannot execute exchange RPC');
reset role;

select * from finish();
rollback;
