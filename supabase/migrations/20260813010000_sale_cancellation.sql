-- Zebra Retail · auditable, idempotent cancellation for an erroneous confirmed sale.
-- This never deletes the original sale, line, payment or FX snapshot.

create type public.sale_payment_status as enum ('captured', 'reversed');

alter table public.sales
  add column cancelled_at timestamptz,
  add column cancelled_by uuid references public.profiles(id) on delete restrict,
  add column cancellation_reason text,
  add constraint sales_cancellation_snapshot_check check (
    (status = 'confirmed' and cancelled_at is null and cancelled_by is null and cancellation_reason is null)
    or
    (status = 'cancelled' and cancelled_at is not null and cancelled_by is not null and cancellation_reason is not null)
  );

alter table public.sale_payments
  add column status public.sale_payment_status not null default 'captured',
  add column reversed_at timestamptz,
  add column reversed_by uuid references public.profiles(id) on delete restrict,
  add constraint sale_payment_reversal_snapshot_check check (
    (status = 'captured' and reversed_at is null and reversed_by is null)
    or
    (status = 'reversed' and reversed_at is not null and reversed_by is not null)
  );

create or replace function public.cancel_sale(
  p_store_id uuid,
  p_sale_id uuid,
  p_reason text,
  p_cancelled_at timestamptz default now()
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_sale public.sales%rowtype;
  v_line record;
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  if v_actor_id is null or not public.user_has_store_access(p_store_id) then
    raise exception 'No access to this store';
  end if;
  if p_sale_id is null or v_reason = '' then
    raise exception 'Sale and cancellation reason are required';
  end if;

  -- Row locking serializes concurrent cancellation attempts. The second caller
  -- reads the committed cancelled status and returns a replay without movements.
  select * into v_sale
  from public.sales
  where id = p_sale_id and store_id = p_store_id
  for update;
  if not found then
    raise exception 'Sale was not found in this store';
  end if;
  if v_sale.status = 'cancelled' then
    return jsonb_build_object('sale_id', v_sale.id, 'status', 'cancelled', 'idempotent_replay', true);
  end if;
  if v_sale.status <> 'confirmed' then
    raise exception 'Only confirmed sales can be cancelled';
  end if;

  for v_line in
    select variant_id, quantity
    from public.sale_lines
    where sale_id = v_sale.id
    order by id
  loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_store_id::text || v_line.variant_id::text, 0));
    insert into public.inventory_movements (
      store_id, variant_id, movement_type, quantity, occurred_at, actor_id, reason
    ) values (
      p_store_id, v_line.variant_id, 'sale_cancellation', v_line.quantity, p_cancelled_at, v_actor_id, v_reason
    );
  end loop;

  update public.sale_payments
  set status = 'reversed', reversed_at = p_cancelled_at, reversed_by = v_actor_id
  where sale_id = v_sale.id and status = 'captured';

  update public.sales
  set status = 'cancelled', cancelled_at = p_cancelled_at, cancelled_by = v_actor_id, cancellation_reason = v_reason
  where id = v_sale.id;

  insert into public.audit_logs (store_id, actor_id, action, entity_type, entity_id, details)
  values (
    p_store_id, v_actor_id, 'sale.cancelled', 'sale', v_sale.id,
    jsonb_build_object('reason', v_reason, 'line_count', (select count(*) from public.sale_lines where sale_id = v_sale.id))
  );

  return jsonb_build_object('sale_id', v_sale.id, 'status', 'cancelled', 'idempotent_replay', false);
end;
$$;

revoke all on function public.cancel_sale(uuid, uuid, text, timestamptz) from public;
grant execute on function public.cancel_sale(uuid, uuid, text, timestamptz) to authenticated;

-- Rollback outline: only after resolving any cancelled-sale records, revoke and
-- drop cancel_sale, drop the payment/sale snapshot constraints and columns, then
-- drop sale_payment_status. Inventory/audit records intentionally remain ledger history.
