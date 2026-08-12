import { createClient } from "@/lib/supabase/client";
import type { InventoryMovementHistoryItem, InventoryMovementSource } from "@/features/inventory/model/types";

type MovementRow = {
  id: string;
  variant_id: string;
  movement_type: string;
  quantity: number;
  occurred_at: string;
  actor_id: string | null;
  receipt_line_id: string | null;
  reason: string | null;
};

type ProfileRow = { id: string; full_name: string | null };

export function movementSource(movementType: string): InventoryMovementSource {
  if (movementType === "receipt") return "receipt";
  if (movementType === "sale") return "sale";
  if (movementType === "adjustment") return "adjustment";
  if (movementType === "exchange_in" || movementType === "exchange_out") return "exchange";
  if (movementType === "transfer_in" || movementType === "transfer_out") return "transfer";
  if (movementType === "write_off") return "write_off";
  if (movementType === "sale_cancellation") return "sale_cancellation";
  return "unknown";
}

export function mapMovementHistory(rows: MovementRow[], profiles: ProfileRow[]): InventoryMovementHistoryItem[] {
  const namesById = new Map(profiles.map((profile) => [profile.id, profile.full_name?.trim() || "Zebra team member"]));
  return rows.map((row) => ({
    id: row.id,
    variantId: row.variant_id,
    quantity: Number(row.quantity),
    occurredAt: row.occurred_at,
    actorName: row.actor_id ? namesById.get(row.actor_id) ?? "Zebra team member" : "System",
    source: movementSource(row.movement_type),
    reason: row.reason,
    receiptLineId: row.receipt_line_id,
  }));
}

export async function loadMovementHistory({ storeId, variantId, limit = 50 }: { storeId: string; variantId: string; limit?: number }): Promise<InventoryMovementHistoryItem[]> {
  if (!storeId || !variantId) return [];
  const client = createClient();
  const { data, error } = await client
    .from("inventory_movements")
    .select("id, variant_id, movement_type, quantity, occurred_at, actor_id, receipt_line_id, reason")
    .eq("store_id", storeId)
    .eq("variant_id", variantId)
    .order("occurred_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw error;

  const rows = (data ?? []) as MovementRow[];
  const actorIds = [...new Set(rows.flatMap((row) => row.actor_id ? [row.actor_id] : []))];
  if (!actorIds.length) return mapMovementHistory(rows, []);

  const { data: profileData, error: profileError } = await client
    .from("profiles")
    .select("id, full_name")
    .in("id", actorIds);
  if (profileError) throw profileError;
  return mapMovementHistory(rows, (profileData ?? []) as ProfileRow[]);
}
