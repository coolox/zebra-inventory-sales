-- Zebra Retail · store default and model override low-stock policy.

create table public.store_inventory_policies (
  store_id uuid primary key references public.stores(id) on delete cascade,
  low_stock_threshold integer not null default 2 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete restrict
);
alter table public.product_models add column low_stock_threshold integer check (low_stock_threshold >= 0);
alter table public.store_inventory_policies enable row level security;
grant select on public.store_inventory_policies to authenticated;
create policy "inventory policies: member read" on public.store_inventory_policies for select to authenticated using (public.user_has_store_access(store_id));

create or replace function public.set_low_stock_threshold(p_store_id uuid, p_model_id uuid, p_threshold integer)
returns integer language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can set low-stock thresholds'; end if;
  if p_threshold is null or p_threshold < 0 then raise exception 'Threshold must be zero or greater'; end if;
  if p_model_id is null then
    insert into public.store_inventory_policies (store_id, low_stock_threshold, updated_by) values (p_store_id, p_threshold, auth.uid())
    on conflict (store_id) do update set low_stock_threshold = excluded.low_stock_threshold, updated_at = now(), updated_by = excluded.updated_by;
  else
    update public.product_models set low_stock_threshold = p_threshold, updated_at = now() where id = p_model_id and store_id = p_store_id;
    if not found then raise exception 'Product model was not found in this store'; end if;
  end if;
  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details) values (p_store_id, auth.uid(), 'inventory.low_stock_threshold_set', case when p_model_id is null then 'store_inventory_policy' else 'product_model' end, p_model_id, jsonb_build_object('threshold', p_threshold));
  return p_threshold;
end;
$$;

create or replace function public.load_low_stock(p_store_id uuid)
returns table (variant_id uuid, product_model_id uuid, stock integer, threshold integer) language sql stable security definer set search_path = '' as $$
  select v.id, m.id, coalesce(sum(im.quantity), 0)::integer, coalesce(m.low_stock_threshold, policy.low_stock_threshold, 2)
  from public.product_variants v join public.product_models m on m.id = v.product_model_id
  left join public.inventory_movements im on im.variant_id = v.id and im.store_id = p_store_id
  left join public.store_inventory_policies policy on policy.store_id = p_store_id
  where m.store_id = p_store_id and m.is_active and v.is_active and public.user_has_store_access(p_store_id)
  group by v.id, m.id, m.low_stock_threshold, policy.low_stock_threshold
  having coalesce(sum(im.quantity), 0) <= coalesce(m.low_stock_threshold, policy.low_stock_threshold, 2)
  order by coalesce(sum(im.quantity), 0), v.id;
$$;
revoke all on function public.set_low_stock_threshold(uuid, uuid, integer), public.load_low_stock(uuid) from public;
grant execute on function public.set_low_stock_threshold(uuid, uuid, integer), public.load_low_stock(uuid) to authenticated;
