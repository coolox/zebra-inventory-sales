begin;

select plan(18);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'sales-rpc-test@example.test',
  crypt('local-test-only', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.stores (id, code, name, timezone)
values ('00000000-0000-0000-0000-000000000010', 'test-sales', 'Sales RPC Test Store', 'Europe/Istanbul');

insert into public.store_memberships (store_id, user_id, role, status)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'seller', 'active');

insert into public.product_models (id, store_id, model_code, name, brand, category, gender)
values ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'SQL-SALE-TEST', 'SQL Sale Test Model', 'Zebra', 'clothing', 'unisex');

insert into public.product_variants (id, product_model_id, color, size)
values ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', 'Black', 'M');

insert into public.purchase_receipts (id, store_id, status, source, received_at, created_by, confirmed_by, confirmed_at)
values ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000010', 'confirmed', 'manual', '2026-08-10 10:00:00+00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', now());

insert into public.purchase_receipt_lines (receipt_id, variant_id, quantity, unit_cost, currency, eur_rate, unit_cost_eur)
values ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000030', 10, 5, 'EUR', 1, 5);

insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000030', 'receipt', 10, '2026-08-10 10:00:00+00', '00000000-0000-0000-0000-000000000001', 'Sales RPC test stock');

insert into public.exchange_rates (business_date, currency, eur_rate, entered_by)
values ('2026-08-10', 'USD', 0.90000000, '00000000-0000-0000-0000-000000000001');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);

create function pg_temp.sale_error(p_lines jsonb, p_payments jsonb, p_idempotency_key uuid)
returns text language plpgsql as $$
begin
  perform public.confirm_sale_with_payments(
    '00000000-0000-0000-0000-000000000010',
    p_lines,
    p_payments,
    p_idempotency_key,
    '2026-08-10 10:00:00+00',
    'per_item'
  );
  return null;
exception when others then
  return sqlerrm;
end;
$$;

select ok(
  (public.confirm_sale_with_payments(
    '00000000-0000-0000-0000-000000000010',
    '[
      {"variant_id":"00000000-0000-0000-0000-000000000030","quantity":1,"unit_price":10,"currency":"EUR"},
      {"variant_id":"00000000-0000-0000-0000-000000000030","quantity":1,"unit_price":12,"currency":"USD"}
    ]'::jsonb,
    '[
      {"method":"cash","amount":10,"currency":"EUR"},
      {"method":"card","amount":12,"currency":"USD"}
    ]'::jsonb,
    '00000000-0000-0000-0000-000000000101',
    '2026-08-10 10:00:00+00',
    'per_item'
  ) ->> 'idempotent_replay')::boolean = false,
  'mixed native-currency sale succeeds'
);

select ok(
  (select count(*) = 2 from public.sale_lines where sale_id = (select id from public.sales where idempotency_key = '00000000-0000-0000-0000-000000000101')),
  'same variant can be stored as separate EUR and USD lines'
);

select ok(
  exists (
    select 1 from public.sale_payments payment
    join public.sales sale on sale.id = payment.sale_id
    where sale.idempotency_key = '00000000-0000-0000-0000-000000000101'
      and payment.method = 'card'
      and payment.amount = 12
      and payment.currency = 'USD'
      and payment.eur_rate = 0.90000000
      and payment.amount_eur = 10.80
  ),
  'payment stores original USD amount and FX snapshot'
);

select ok(
  (select count(*) = 2 from public.inventory_movements where movement_type = 'sale'),
  'successful repeated-variant sale creates one movement per line'
);

select ok(
  exists (
    select 1 from public.audit_logs audit
    join public.sales sale on sale.id = audit.entity_id
    where sale.idempotency_key = '00000000-0000-0000-0000-000000000101'
      and audit.action = 'sale.confirmed'
      and audit.details ->> 'pricing_mode' = 'per_item'
  ),
  'successful sale writes an audited per-item confirmation'
);

select ok(
  pg_temp.sale_error(
    '[{"variant_id":"00000000-0000-0000-0000-000000000030","quantity":50,"unit_price":10,"currency":"EUR"}]'::jsonb,
    '[{"method":"cash","amount":500,"currency":"EUR"}]'::jsonb,
    '00000000-0000-0000-0000-000000000102'
  ) like '%Insufficient stock for selected variant%',
  'insufficient stock is rejected'
);

select ok(
  not exists (select 1 from public.sales where idempotency_key = '00000000-0000-0000-0000-000000000102'),
  'insufficient stock rolls back the sale record'
);

select ok(
  (select coalesce(sum(quantity), 0) = 8 from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000030'),
  'insufficient stock leaves inventory unchanged'
);

select ok(
  pg_temp.sale_error(
    '[{"variant_id":"00000000-0000-0000-0000-000000000030","quantity":1,"unit_price":10,"currency":"GBP"}]'::jsonb,
    '[{"method":"cash","amount":10,"currency":"EUR"}]'::jsonb,
    '00000000-0000-0000-0000-000000000103'
  ) like '%Owner must set the GBP exchange rate%',
  'missing sale FX rate is rejected'
);

select ok(
  not exists (select 1 from public.sales where idempotency_key = '00000000-0000-0000-0000-000000000103'),
  'missing sale FX rolls back the sale record'
);

select ok(
  pg_temp.sale_error(
    '[{"variant_id":"00000000-0000-0000-0000-000000000030","quantity":1,"unit_price":10,"currency":"EUR"}]'::jsonb,
    '[{"method":"cash","amount":5,"currency":"EUR"}]'::jsonb,
    '00000000-0000-0000-0000-000000000104'
  ) like '%Payment total must equal sale total%',
  'payment mismatch is rejected'
);

select ok(
  not exists (select 1 from public.sales where idempotency_key = '00000000-0000-0000-0000-000000000104'),
  'payment mismatch rolls back the sale record'
);

select ok(
  (select coalesce(sum(quantity), 0) = 8 from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000030'),
  'payment mismatch rolls back stock movements'
);

select ok(
  (public.confirm_sale_with_payments(
    '00000000-0000-0000-0000-000000000010',
    '[{"variant_id":"00000000-0000-0000-0000-000000000030","quantity":6,"unit_price":10,"currency":"EUR"}]'::jsonb,
    '[{"method":"bank_transfer","amount":60,"currency":"EUR"}]'::jsonb,
    '00000000-0000-0000-0000-000000000105',
    '2026-08-10 10:00:00+00',
    'per_item'
  ) ->> 'idempotent_replay')::boolean = false,
  'first sequential sale reserves the remaining stock atomically'
);

select ok(
  pg_temp.sale_error(
    '[{"variant_id":"00000000-0000-0000-0000-000000000030","quantity":3,"unit_price":10,"currency":"EUR"}]'::jsonb,
    '[{"method":"cash","amount":30,"currency":"EUR"}]'::jsonb,
    '00000000-0000-0000-0000-000000000106'
  ) like '%Insufficient stock for selected variant%',
  'sequentially conflicting sale is rejected after stock changes'
);

select ok(
  (select coalesce(sum(quantity), 0) = 2 from public.inventory_movements where variant_id = '00000000-0000-0000-0000-000000000030'),
  'sequential conflict does not oversell the variant'
);

select ok(
  (select count(*) = 3 from public.inventory_movements where movement_type = 'sale'),
  'only successful sales create inventory movements'
);

select ok(
  (select count(*) = 2 from public.audit_logs where action = 'sale.confirmed'),
  'only successful sales create audit records'
);

select * from finish();

rollback;
