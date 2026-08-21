import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

export async function updateProductModelDetails(input: { storeId: string; modelId: string; name: string; gender: Product["gender"]; lowStockThreshold: number; purchaseCost: number; purchaseCurrency: Product["currency"]; purchaseCostEur: number }) {
  const { error } = await createClient().rpc("update_product_model_details", {
    p_store_id: input.storeId, p_model_id: input.modelId, p_name: input.name,
    p_gender: input.gender, p_low_stock_threshold: input.lowStockThreshold,
    p_purchase_cost: input.purchaseCost, p_purchase_currency: input.purchaseCurrency,
    p_purchase_cost_eur: input.purchaseCostEur,
  });
  if (error) throw new Error(error.message);
}
