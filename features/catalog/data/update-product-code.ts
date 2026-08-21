import { createClient } from "@/lib/supabase/client";

export async function updateProductModelCode({ storeId, modelId, modelCode }: { storeId: string; modelId: string; modelCode: string }) {
  const { data, error } = await createClient().rpc("update_product_model_code", {
    p_store_id: storeId,
    p_model_id: modelId,
    p_model_code: modelCode,
  });

  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as { model_code?: unknown } | null;
  if (!row || typeof row.model_code !== "string" || row.model_code !== modelCode) {
    throw new Error("Product code save was not confirmed by the server.");
  }

  return row.model_code;
}
