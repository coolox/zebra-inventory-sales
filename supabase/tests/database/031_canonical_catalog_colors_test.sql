begin;

select plan(6);

select is(public.canonical_catalog_color(' siyah '), 'Black', 'Turkish black is stored as canonical Black');
select is(public.canonical_catalog_color('dark blue'), 'Navy', 'known multi-word synonym is canonicalized');

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003101', 'authenticated', 'authenticated', 'canonical-color-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

insert into public.stores (id, code, name)
values ('00000000-0000-0000-0000-000000003111', 'canonical-colors', 'Canonical Colors Store');
insert into public.store_memberships (store_id, user_id, role, status)
values ('00000000-0000-0000-0000-000000003111', '00000000-0000-0000-0000-000000003101', 'owner', 'active');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003101', true);
set local role authenticated;

select is(
  (public.confirm_inventory_receipt(
    '00000000-0000-0000-0000-000000003111',
    '{"model_code":"COLOR-01","name":"Canonical shirt","brand":"Zebra","category":"clothing","gender":"unisex"}'::jsonb,
    '[{"color":"siyah","size":"M","quantity":1,"unit_cost":10,"currency":"EUR"}]'::jsonb,
    '00000000-0000-0000-0000-000000003121'
  ) ->> 'variant_count')::integer,
  1,
  'receipt accepts a Turkish color alias'
);

select is(
  (select color from public.product_variants where product_model_id = (select id from public.product_models where store_id = '00000000-0000-0000-0000-000000003111' and model_code = 'COLOR-01')),
  'Black',
  'receipt persists the canonical color'
);

select is(
  (public.confirm_inventory_receipt(
    '00000000-0000-0000-0000-000000003111',
    '{"model_code":"COLOR-01"}'::jsonb,
    '[{"color":"Black","size":"M","quantity":1,"unit_cost":10,"currency":"EUR"}]'::jsonb,
    '00000000-0000-0000-0000-000000003122'
  ) ->> 'variant_count')::integer,
  1,
  'canonical spelling reuses the receipt variant'
);

select is(
  (select count(*) from public.product_variants where product_model_id = (select id from public.product_models where store_id = '00000000-0000-0000-0000-000000003111' and model_code = 'COLOR-01')),
  1::bigint,
  'aliases do not create a duplicate color-size variant'
);

reset role;
select * from finish();
rollback;
