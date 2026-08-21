begin;

select plan(8);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003701', 'authenticated', 'authenticated', 'image-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003702', 'authenticated', 'authenticated', 'image-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000003703', 'authenticated', 'authenticated', 'image-other-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name) values ('00000000-0000-0000-0000-000000003711', 'images', 'Images Store'), ('00000000-0000-0000-0000-000000003712', 'images-other', 'Images Other Store');
insert into public.store_memberships (store_id, user_id, role, status) values ('00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003701', 'owner', 'active'), ('00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003702', 'seller', 'active'), ('00000000-0000-0000-0000-000000003712', '00000000-0000-0000-0000-000000003703', 'owner', 'active');
insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values ('00000000-0000-0000-0000-000000003721', '00000000-0000-0000-0000-000000003711', 'PHOTO-01', 'Photo model', 'Zebra', 'clothing', 'unisex');
insert into public.product_variants (id, product_model_id, color, size) values ('00000000-0000-0000-0000-000000003731', '00000000-0000-0000-0000-000000003721', 'Black', 'M');
insert into public.product_images (id, product_model_id, storage_path, position) values ('00000000-0000-0000-0000-000000003741', '00000000-0000-0000-0000-000000003721', 'images/PHOTO-01/historical.png', 0), ('00000000-0000-0000-0000-000000003742', '00000000-0000-0000-0000-000000003721', 'images/PHOTO-01/cleanup.png', 1);
insert into public.sales (id, store_id, seller_id, total_amount_eur) values ('00000000-0000-0000-0000-000000003751', '00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003701', 20);
insert into public.sale_lines (sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values ('00000000-0000-0000-0000-000000003751', '00000000-0000-0000-0000-000000003731', 1, 20, 'EUR', 1, 20, 10);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003702', true); set local role authenticated;
select throws_like($$select public.remove_product_image('00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003721', 'images/PHOTO-01/cleanup.png')$$, '%Only an Owner%', 'Seller cannot delete a photo'); reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003703', true); set local role authenticated;
select throws_like($$select public.remove_product_image('00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003721', 'images/PHOTO-01/cleanup.png')$$, '%Only an Owner%', 'Cross-store Owner cannot delete a photo'); reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000003701', true); set local role authenticated;
select is(public.remove_product_image('00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003721', 'images/PHOTO-01/historical.png'), false, 'Historical sale photo keeps its Storage object');
select is((select count(*) from public.product_images where storage_path = 'images/PHOTO-01/historical.png'), 0::bigint, 'Historical image row is removed from the active carousel');
select is((select product_image_path from public.sale_lines where sale_id = '00000000-0000-0000-0000-000000003751'), 'images/PHOTO-01/historical.png', 'Historical sale keeps its image snapshot');
select is(public.remove_product_image('00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003721', 'images/PHOTO-01/cleanup.png'), true, 'Non-historical photo authorizes Storage cleanup');
select is((select details ->> 'historical_reference_retained' from public.audit_logs where entity_id = '00000000-0000-0000-0000-000000003741'), 'true', 'Audit records historical retention');
select is(public.remove_product_image('00000000-0000-0000-0000-000000003711', '00000000-0000-0000-0000-000000003721', 'images/PHOTO-01/cleanup.png'), true, 'Retry after DB deletion remains safe for Storage cleanup');
reset role;

select * from finish();
rollback;
