import { createClient } from "@/lib/supabase/client";

export type LowStockBalance = { variantId: string; modelId: string; stock: number; threshold: number };
export async function loadLowStock(storeId: string): Promise<LowStockBalance[]> {
  if (!storeId) return [];
  const { data, error } = await createClient().rpc("load_low_stock", { p_store_id: storeId });
  if (error) throw new Error(error.message);
  return ((data ?? []) as { variant_id: string; product_model_id: string; stock: number; threshold: number }[]).map((row) => ({ variantId: row.variant_id, modelId: row.product_model_id, stock: Number(row.stock), threshold: Number(row.threshold) }));
}
