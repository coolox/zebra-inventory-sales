begin;

select plan(3);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003401', 'authenticated', 'authenticated', 'owner-fallback@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003402', 'authenticated', 'authenticated', 'seller-view@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name) values
  ('00000000-0000-0000-0000-000000003411', 'seller-label', 'Seller Label Store');
insert into public.store_memberships (store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000003411', '00000000-0000-0000-0000-000000003401', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000003411', '00000000-0000-0000-0000-000000003402', 'seller', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values
  ('00000000-0000-0000-0000-000000003421', '00000000-0000-0000-0000-000000003411', 'LABEL-1', 'Label product', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values
  ('00000000-0000-0000-0000-000000003431', '00000000-0000-0000-0000-000000003421', 'Black', 'M');
insert into public.sales (id, store_id, seller_id, status, total_amount_eur, cancelled_at, cancelled_by, cancellation_reason) values
  ('00000000-0000-0000-0000-000000003441', '00000000-0000-0000-0000-000000003411', '00000000-0000-0000-0000-000000003401', 'confirmed', 100, null, null, null);
insert into public.sale_lines (id, sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values
  ('00000000-0000-0000-0000-000000003451', '00000000-0000-0000-0000-000000003441', '00000000-0000-0000-0000-000000003431', 1, 100, 'EUR', 1, 100, 50);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003401', false);
select is(
  (select dimension_label from public.get_reporting_breakdown('00000000-0000-0000-0000-000000003411', '2000-01-01', '2100-01-01', 'seller') where dimension_key = '00000000-0000-0000-0000-000000003401'),
  'owner-fallback@example.test',
  'Owner seller report falls back from empty display name to approved account email'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003402', false);
select is(
  (select dimension_label from public.get_reporting_breakdown('00000000-0000-0000-0000-000000003411', '2000-01-01', '2100-01-01', 'seller') where dimension_key = '00000000-0000-0000-0000-000000003401'),
  'Unknown seller',
  'Seller caller does not receive another actor email through the breakdown RPC'
);

update public.profiles set full_name = 'Owner Display Name' where id = '00000000-0000-0000-0000-000000003401';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003401', false);
select is(
  (select dimension_label from public.get_reporting_breakdown('00000000-0000-0000-0000-000000003411', '2000-01-01', '2100-01-01', 'seller') where dimension_key = '00000000-0000-0000-0000-000000003401'),
  'Owner Display Name',
  'Display name remains preferred over approved account email'
);

select * from finish();
rollback;
