begin;

select plan(13);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000801', 'authenticated', 'authenticated', 'cancel-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000802', 'authenticated', 'authenticated', 'cancel-outsider@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name)
values ('00000000-0000-0000-0000-000000000811', 'cancel-store', 'Cancellation Test Store');
insert into public.store_memberships (store_id, user_id, role, status)
values ('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000801', 'seller', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender)
values ('00000000-0000-0000-0000-000000000821', '00000000-0000-0000-0000-000000000811', 'CANCEL-TEST', 'Cancellation Test Model', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size)
values ('00000000-0000-0000-0000-000000000831', '00000000-0000-0000-0000-000000000821', 'Black', 'M');
insert into public.sales (id, store_id, seller_id, sold_at, total_amount_eur)
values ('00000000-0000-0000-0000-000000000841', '00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000801', '2026-08-13 10:00:00+00', 40);
insert into public.sale_lines (sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur)
values ('00000000-0000-0000-0000-000000000841', '00000000-0000-0000-0000-000000000831', 2, 20, 'EUR', 1, 20, 10);
insert into public.sale_payments (sale_id, method, amount, currency, eur_rate, amount_eur)
values ('00000000-0000-0000-0000-000000000841', 'cash', 40, 'EUR', 1, 40);
insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, actor_id, reason)
values
  ('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000831', 'receipt', 5, '00000000-0000-0000-0000-000000000801', 'Fixture receipt'),
  ('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000831', 'sale', -2, '00000000-0000-0000-0000-000000000801', 'Fixture sale');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000801', false);
select ok((public.cancel_sale('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000841', 'Wrong size', '2026-08-13 10:05:00+00') ->> 'idempotent_replay')::boolean = false, 'seller cancels a confirmed sale in own store');
select is((select status::text from public.sales where id = '00000000-0000-0000-0000-000000000841'), 'cancelled', 'sale remains in history with cancelled status');
select is((select cancellation_reason from public.sales where id = '00000000-0000-0000-0000-000000000841'), 'Wrong size', 'sale stores mandatory cancellation reason');
select is((select coalesce(sum(quantity), 0)::bigint from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000831'), 5::bigint, 'reversal movement restores exact stock');
select is((select count(*) from public.inventory_movements where movement_type = 'sale_cancellation'), 1::bigint, 'one reversal movement is written per cancelled line');
select ok(exists (select 1 from public.sale_payments where sale_id = '00000000-0000-0000-0000-000000000841' and status = 'reversed' and amount = 40 and eur_rate = 1 and amount_eur = 40), 'payment is reversed without changing its money or FX snapshot');
select ok(exists (select 1 from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000000841' and action = 'sale.cancelled' and details ->> 'reason' = 'Wrong size'), 'cancellation writes an audit record with reason');
select ok((public.cancel_sale('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000841', 'Retry', '2026-08-13 10:06:00+00') ->> 'idempotent_replay')::boolean, 'locked repeated cancellation returns idempotent replay');
select is((select count(*) from public.inventory_movements where movement_type = 'sale_cancellation'), 1::bigint, 'replay cannot create a second stock reversal');
select is((select count(*) from public.audit_logs where action = 'sale.cancelled'), 1::bigint, 'replay cannot create a second audit event');
select throws_like($$select public.cancel_sale('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000841', '   ')$$, '%reason are required%', 'blank reason is rejected even for replay');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000802', false);
select throws_like($$select public.cancel_sale('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000841', 'Unauthorized')$$, '%No access to this store%', 'outsider cannot cancel another store sale');

reset role;
set local role anon;
select throws_like($$select public.cancel_sale('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000841', 'Anonymous')$$, '%permission denied%', 'anonymous cannot execute cancellation RPC');
reset role;

select * from finish();
rollback;
