import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

export async function confirmInventoryAdjustment({ storeId, variantId, quantityDelta, reason, locale }: { storeId: string; variantId: string; quantityDelta: number; reason: string; locale: Locale }) {
  if (!storeId || !variantId || !Number.isInteger(quantityDelta) || quantityDelta === 0 || !reason.trim()) {
    throw new Error(locale === "tr" ? "Geçerli miktar ve neden gereklidir." : "A non-zero quantity and reason are required.");
  }
  const { error } = await createClient().rpc("confirm_inventory_adjustment", {
    p_store_id: storeId, p_variant_id: variantId, p_quantity_delta: quantityDelta, p_reason: reason.trim(), p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw new Error(/Only an Owner|No access/i.test(error.message) ? (locale === "tr" ? "Yalnızca sahip stok düzeltebilir." : "Only an Owner can adjust inventory.") : error.message);
}
