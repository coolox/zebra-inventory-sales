-- Zebra Retail · use the store's business date for receipt FX snapshots.
-- Supabase stores timestamps in UTC. Without this wrapper a receipt created
-- shortly after midnight in Istanbul could look up the previous UTC day's FX.
-- Apply after 20260808160000_inventory_receipts.sql.

alter function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text)
  rename to confirm_inventory_receipt_internal;

create function public.confirm_inventory_receipt(
  p_store_id uuid,
  p_model jsonb,
  p_lines jsonb,
  p_idempotency_key uuid,
  p_received_at timestamptz default now(),
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_timezone text;
begin
  select timezone into v_timezone
  from public.stores
  where id = p_store_id and is_active = true;

  if v_timezone is null then
    raise exception 'Store was not found or is inactive';
  end if;

  -- The internal receipt transaction casts p_received_at to date when it
  -- reads exchange_rates. Scope the session setting to this transaction so
  -- that date is the store's local business date, while preserving the exact
  -- timestamp in the receipt and inventory movement.
  perform pg_catalog.set_config('TimeZone', v_timezone, true);

  return public.confirm_inventory_receipt_internal(
    p_store_id,
    p_model,
    p_lines,
    p_idempotency_key,
    p_received_at,
    p_notes
  );
end;
$$;

revoke all on function public.confirm_inventory_receipt_internal(uuid, jsonb, jsonb, uuid, timestamptz, text) from public;
revoke all on function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text) from public;
grant execute on function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text) to authenticated;

comment on function public.confirm_inventory_receipt(uuid, jsonb, jsonb, uuid, timestamptz, text) is
  'Confirms one manual receipt atomically, using the store local business date for FX lookup.';
