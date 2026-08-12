-- Zebra Retail · protect Owners and make repeat seller invitations idempotent.

create or replace function public.activate_invited_seller(
  p_store_id uuid, p_user_id uuid, p_email text, p_full_name text, p_phone text, p_idempotency_key uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor_id uuid := auth.uid(); v_invitation public.seller_invitations;
begin
  if v_actor_id is null then raise exception 'Authentication is required'; end if;
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can invite a Seller'; end if;
  if p_user_id is null or nullif(trim(p_email), '') is null or nullif(trim(p_full_name), '') is null or p_idempotency_key is null then raise exception 'Seller identity, name and idempotency key are required'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || p_idempotency_key::text, 0));
  select * into v_invitation from public.seller_invitations where store_id = p_store_id and idempotency_key = p_idempotency_key;
  if v_invitation.id is not null then return jsonb_build_object('invitation_id', v_invitation.id, 'idempotent_replay', true); end if;
  select * into v_invitation from public.seller_invitations where store_id = p_store_id and invited_user_id = p_user_id;
  if v_invitation.id is not null then return jsonb_build_object('invitation_id', v_invitation.id, 'idempotent_replay', true); end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then raise exception 'Invited Auth user profile was not found'; end if;
  if exists (select 1 from public.store_memberships where store_id = p_store_id and user_id = p_user_id and role = 'owner') then raise exception 'An Owner cannot be invited as a Seller'; end if;

  update public.profiles set full_name = trim(p_full_name), phone = nullif(trim(p_phone), ''), status = 'active', updated_at = now() where id = p_user_id;
  insert into public.store_memberships (store_id, user_id, role, status) values (p_store_id, p_user_id, 'seller', 'active')
  on conflict (store_id, user_id) do update set role = 'seller', status = 'active';
  insert into public.seller_invitations (store_id, invited_user_id, email, invited_by, idempotency_key)
  values (p_store_id, p_user_id, lower(trim(p_email)), v_actor_id, p_idempotency_key) returning * into v_invitation;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (p_store_id, v_actor_id, 'seller.invited', 'seller_invitation', v_invitation.id, jsonb_build_object('user_id', p_user_id, 'email', lower(trim(p_email))));
  return jsonb_build_object('invitation_id', v_invitation.id, 'idempotent_replay', false);
end;
$$;
