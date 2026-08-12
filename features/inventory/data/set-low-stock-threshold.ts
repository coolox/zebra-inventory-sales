import { createClient } from "@/lib/supabase/client";
export async function setLowStockThreshold(storeId: string, modelId: string | null, threshold: number) {
  if (!Number.isInteger(threshold) || threshold < 0) throw new Error("Threshold must be zero or greater.");
  const { error } = await createClient().rpc("set_low_stock_threshold", { p_store_id: storeId, p_model_id: modelId, p_threshold: threshold });
  if (error) throw new Error(error.message);
}
