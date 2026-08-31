begin;

select plan(10);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003801', 'authenticated', 'authenticated', 'fx-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003802', 'authenticated', 'authenticated', 'fx-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name) values ('00000000-0000-0000-0000-000000003810', 'fx-test', 'FX Test Store');
insert into public.store_memberships (store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000003810', '00000000-0000-0000-0000-000000003801', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000003810', '00000000-0000-0000-0000-000000003802', 'seller', 'active');

-- This mirrors a row written by the pre-provenance contract: new defaults preserve it as manual.
insert into public.exchange_rates (business_date, currency, eur_rate, entered_by)
values ('2026-08-31', 'USD', 0.85000000, '00000000-0000-0000-0000-000000003801');

select is((select provider from public.exchange_rates where currency = 'USD'), 'manual', 'legacy-shaped rate defaults to manual provider');
select is((select rate_basis from public.exchange_rates where currency = 'USD'), 'owner_manual', 'legacy-shaped rate defaults to owner manual basis');
select is((select status::text from public.exchange_rates where currency = 'USD'), 'manual_override', 'legacy-shaped rate defaults to visible manual override');
select is((select source_rate_date from public.exchange_rates where currency = 'USD'), date '2026-08-31', 'legacy-shaped rate source date remains its business date');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003802', true);
set local role authenticated;
select throws_like(
  $$select public.upsert_exchange_rate(date '2026-08-31', 'TRY', 0.02000000)$$,
  '%Only an Owner can set exchange rates%',
  'Seller cannot create a manual FX override'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003801', true);
set local role authenticated;
select lives_ok(
  $$select public.upsert_exchange_rate(date '2026-08-31', 'TRY', 0.02000000)$$,
  'Owner can create an audited manual FX override'
);
select is((select provider from public.exchange_rates where currency = 'TRY'), 'manual', 'Owner save keeps manual provider');
select is((select status::text from public.exchange_rates where currency = 'TRY'), 'manual_override', 'Owner save explicitly records manual override status');
select ok(
  exists (
    select 1 from public.audit_logs
    where action = 'exchange_rate.upserted'
      and details @> '{"provider":"manual","rate_basis":"owner_manual","status":"manual_override"}'::jsonb
  ),
  'Owner manual override audit stores provenance'
);
select throws_like(
  $$insert into public.exchange_rates (business_date, currency, eur_rate, provider, rate_basis, source_rate_date, status) values (date '2026-09-01', 'EUR', 1, 'TCMB', 'forex_selling', date '2026-09-01', 'automatic')$$,
  '%permission denied%',
  'Owner cannot bypass the audited FX RPC with a direct write'
);
reset role;

select * from finish();
rollback;
