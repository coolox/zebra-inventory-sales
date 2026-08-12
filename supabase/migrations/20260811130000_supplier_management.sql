-- Zebra Retail · owner-maintained supplier directory. Historical receipt links remain immutable.

create or replace function public.save_supplier(
  p_store_id uuid, p_supplier_id uuid, p_name text, p_phone text default null, p_notes text default null
) returns public.suppliers language plpgsql security definer set search_path = '' as $$
declare v_supplier public.suppliers; v_name text := nullif(trim(p_name), '');
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can manage suppliers'; end if;
  if v_name is null then raise exception 'Supplier name is required'; end if;
  if p_supplier_id is null then
    insert into public.suppliers (store_id, name, phone, notes) values (p_store_id, v_name, nullif(trim(p_phone), ''), nullif(trim(p_notes), '')) returning * into v_supplier;
  else
    update public.suppliers set name = v_name, phone = nullif(trim(p_phone), ''), notes = nullif(trim(p_notes), '')
    where id = p_supplier_id and store_id = p_store_id returning * into v_supplier;
    if v_supplier.id is null then raise exception 'Supplier was not found in this store'; end if;
  end if;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details) values (p_store_id, auth.uid(), 'supplier.saved', 'supplier', v_supplier.id, jsonb_build_object('name', v_supplier.name));
  return v_supplier;
end;
$$;

create or replace function public.set_supplier_archived(p_store_id uuid, p_supplier_id uuid, p_archived boolean)
returns public.suppliers language plpgsql security definer set search_path = '' as $$
declare v_supplier public.suppliers;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can manage suppliers'; end if;
  update public.suppliers set is_active = not p_archived where id = p_supplier_id and store_id = p_store_id returning * into v_supplier;
  if v_supplier.id is null then raise exception 'Supplier was not found in this store'; end if;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details) values (p_store_id, auth.uid(), case when p_archived then 'supplier.archived' else 'supplier.restored' end, 'supplier', v_supplier.id, '{}'::jsonb);
  return v_supplier;
end;
$$;

revoke all on function public.save_supplier(uuid, uuid, text, text, text), public.set_supplier_archived(uuid, uuid, boolean) from public;
grant execute on function public.save_supplier(uuid, uuid, text, text, text), public.set_supplier_archived(uuid, uuid, boolean) to authenticated;
