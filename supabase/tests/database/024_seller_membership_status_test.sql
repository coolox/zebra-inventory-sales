begin;

select plan(11);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000601', 'authenticated', 'authenticated', 'membership-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000602', 'authenticated', 'authenticated', 'membership-seller@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000603', 'authenticated', 'authenticated', 'membership-other-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.stores (id, code, name) values
  ('00000000-0000-0000-0000-000000000611', 'membership-store', 'Membership Store'),
  ('00000000-0000-0000-0000-000000000612', 'membership-other-store', 'Membership Other Store');
insert into public.store_memberships (id, store_id, user_id, role, status) values
  ('00000000-0000-0000-0000-000000000621', '00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000601', 'owner', 'active'),
  ('00000000-0000-0000-0000-000000000622', '00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000602', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000000623', '00000000-0000-0000-0000-000000000612', '00000000-0000-0000-0000-000000000603', 'owner', 'active');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000601', true);
set local role authenticated;
select is((select (public.set_seller_membership_status('00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000602', 'blocked'::public.member_status) ->> 'changed')::boolean), true, 'Owner blocks Seller membership');
select is((select status::text from public.store_memberships where id = '00000000-0000-0000-0000-000000000622'), 'blocked', 'blocked Seller loses active membership');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000602', true);
select ok(not public.user_has_store_access('00000000-0000-0000-0000-000000000611'), 'blocked target no longer has workspace access under their session');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000601', true);
select is((select count(*) from public.audit_logs where action = 'seller.deactivated' and entity_id = '00000000-0000-0000-0000-000000000622'), 1::bigint, 'deactivation is audited once');
select is((select (public.set_seller_membership_status('00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000602', 'blocked'::public.member_status) ->> 'changed')::boolean), false, 'same status is idempotent');
select is((select count(*) from public.audit_logs where action = 'seller.deactivated' and entity_id = '00000000-0000-0000-0000-000000000622'), 1::bigint, 'idempotent retry adds no audit record');
select is((select (public.set_seller_membership_status('00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000602', 'active'::public.member_status) ->> 'changed')::boolean), true, 'Owner reactivates Seller membership');
select is((select status::text from public.store_memberships where id = '00000000-0000-0000-0000-000000000622'), 'active', 'reactivated Seller regains active membership');
select is((select count(*) from public.audit_logs where action = 'seller.reactivated' and entity_id = '00000000-0000-0000-0000-000000000622'), 1::bigint, 'reactivation is audited');

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000602', true);
set local role authenticated;
select throws_like($$select public.set_seller_membership_status('00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000602', 'blocked'::public.member_status)$$, '%Only an Owner%', 'Seller cannot change membership status');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000603', true);
set local role authenticated;
select throws_like($$select public.set_seller_membership_status('00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000602', 'blocked'::public.member_status)$$, '%Only an Owner%', 'cross-store Owner cannot change membership status');
reset role;

select * from finish();
rollback;
