begin;

select plan(9);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003901', 'authenticated', 'authenticated', 'fx-sync-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name) values ('00000000-0000-0000-0000-000000003910', 'fx-sync', 'FX Sync Store');
insert into public.store_memberships (store_id, user_id, role, status) values ('00000000-0000-0000-0000-000000003910', '00000000-0000-0000-0000-000000003901', 'owner', 'active');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003901', true);
set local role authenticated;
select throws_like(
  $$select public.apply_automatic_exchange_rates(date '2026-08-31', date '2026-08-31', '[{"currency":"EUR","eur_rate":1},{"currency":"USD","eur_rate":0.86},{"currency":"TRY","eur_rate":0.02}]'::jsonb, 'automatic')$$,
  '%permission denied%',
  'Owner cannot invoke the service-only automatic FX writer'
);
reset role;

insert into public.exchange_rates (business_date, currency, eur_rate, entered_by)
values (date '2026-08-31', 'USD', 0.90000000, '00000000-0000-0000-0000-000000003901');

select is(
  (public.apply_automatic_exchange_rates(
    date '2026-08-31', date '2026-08-31',
    '[{"currency":"EUR","eur_rate":1},{"currency":"USD","eur_rate":0.86},{"currency":"TRY","eur_rate":0.02}]'::jsonb,
    'automatic', null, '2026-08-31 14:00:00+00'
  ) ->> 'updated_rate_count')::integer,
  2,
  'automatic sync writes EUR and TRY but preserves the manual USD override'
);
select is((select eur_rate from public.exchange_rates where business_date = date '2026-08-31' and currency = 'USD'), 0.90000000, 'manual USD rate is not overwritten');
select is((select status::text from public.exchange_rates where business_date = date '2026-08-31' and currency = 'USD'), 'manual_override', 'manual USD provenance is retained');
select is((select status::text from public.exchange_rates where business_date = date '2026-08-31' and currency = 'TRY'), 'automatic', 'automatic TRY provenance is stored');
select is((select updated_rate_count from public.exchange_rate_sync_runs where business_date = date '2026-08-31'), 2, 'sync health records the first write count');

select is(
  (public.apply_automatic_exchange_rates(
    date '2026-08-31', date '2026-08-31',
    '[{"currency":"EUR","eur_rate":1},{"currency":"USD","eur_rate":0.86},{"currency":"TRY","eur_rate":0.02}]'::jsonb,
    'automatic', null, '2026-08-31 14:01:00+00'
  ) ->> 'updated_rate_count')::integer,
  0,
  'identical retry creates no rate writes'
);
select throws_like(
  $$select public.apply_automatic_exchange_rates(date '2026-08-31', date '2026-09-01', '[{"currency":"EUR","eur_rate":1},{"currency":"USD","eur_rate":0.86},{"currency":"TRY","eur_rate":0.02}]'::jsonb, 'automatic')$$,
  '%source date cannot be after business date%',
  'future provider source is rejected before any write'
);
select throws_like(
  $$select public.apply_automatic_exchange_rates(date '2026-09-03', date '2026-08-31', '[{"currency":"EUR","eur_rate":1},{"currency":"USD","eur_rate":0.86},{"currency":"TRY","eur_rate":0.02}]'::jsonb, 'carried_forward', date '2026-09-03')$$,
  '%requires an earlier carried-from business date%',
  'invalid carry metadata is rejected before any write'
);

select * from finish();
rollback;
