-- Zebra Retail · Owner-controlled Seller access without deleting history.

create or replace function public.set_seller_membership_status(
  p_store_id uuid,
  p_seller_id uuid,
  p_status public.member_status
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := auth.uid();
  v_membership public.store_memberships;
begin
  if v_actor_id is null then raise exception 'Authentication is required'; end if;
  if p_status not in ('active'::public.member_status, 'blocked'::public.member_status) then
    raise exception 'Seller status must be active or blocked';
  end if;
  if not public.user_is_store_owner(p_store_id) then
    raise exception 'Only an Owner can change Seller access';
  end if;

  select * into v_membership
  from public.store_memberships
  where store_id = p_store_id and user_id = p_seller_id
  for update;
  if v_membership.id is null then raise exception 'Seller membership was not found'; end if;
  if v_membership.role <> 'seller'::public.app_role then raise exception 'Only a Seller membership can be changed'; end if;
  if v_membership.status = p_status then
    return jsonb_build_object('membership_id', v_membership.id, 'status', v_membership.status, 'changed', false);
  end if;

  update public.store_memberships
  set status = p_status
  where id = v_membership.id;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (
    p_store_id,
    v_actor_id,
    case when p_status = 'blocked'::public.member_status then 'seller.deactivated' else 'seller.reactivated' end,
    'store_membership',
    v_membership.id,
    jsonb_build_object('seller_id', p_seller_id, 'previous_status', v_membership.status, 'next_status', p_status)
  );
  return jsonb_build_object('membership_id', v_membership.id, 'status', p_status, 'changed', true);
end;
$$;

revoke all on function public.set_seller_membership_status(uuid, uuid, public.member_status) from public;
grant execute on function public.set_seller_membership_status(uuid, uuid, public.member_status) to authenticated;
