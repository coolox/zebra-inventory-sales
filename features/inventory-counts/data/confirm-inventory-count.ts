import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

export type InventoryCountLine = { variantId: string; countedQuantity: number };

export async function confirmInventoryCount({ storeId, lines, notes, locale }: { storeId: string; lines: InventoryCountLine[]; notes: string; locale: Locale }) {
  if (!storeId || !lines.length || lines.some((line) => !line.variantId || !Number.isInteger(line.countedQuantity) || line.countedQuantity < 0)) {
    throw new Error(locale === "tr" ? "Geçerli sayım satırları gereklidir." : "Valid count lines are required.");
  }
  const { error } = await createClient().rpc("confirm_inventory_count", {
    p_store_id: storeId,
    p_lines: lines.map((line) => ({ variant_id: line.variantId, counted_quantity: line.countedQuantity })),
    p_notes: notes.trim() || null,
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
}
