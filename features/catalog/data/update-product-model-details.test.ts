import { describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc }) }));

import { updateProductModelDetails } from "./update-product-model-details";

describe("updateProductModelDetails", () => {
  it("sends the complete model-level update through the audited RPC", async () => {
    rpc.mockResolvedValue({ error: null });
    await expect(updateProductModelDetails({ storeId: "store", modelId: "model", name: "Evening dress", gender: "unisex", lowStockThreshold: 3, purchaseCost: 55, purchaseCurrency: "USD", purchaseCostEur: 50.5 })).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith("update_product_model_details", { p_store_id: "store", p_model_id: "model", p_name: "Evening dress", p_gender: "unisex", p_low_stock_threshold: 3, p_purchase_cost: 55, p_purchase_currency: "USD", p_purchase_cost_eur: 50.5 });
  });

  it("returns the server error without treating the update as successful", async () => {
    rpc.mockResolvedValue({ error: { message: "Only an Owner can edit product details" } });
    await expect(updateProductModelDetails({ storeId: "store", modelId: "model", name: "Evening dress", gender: "unisex", lowStockThreshold: 3, purchaseCost: 55, purchaseCurrency: "EUR", purchaseCostEur: 55 })).rejects.toThrow("Only an Owner can edit product details");
  });
});
