import { describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ rpc }),
}));

import { updateProductModelCode } from "./update-product-code";

describe("updateProductModelCode", () => {
  const input = { storeId: "store", modelId: "model", modelCode: "SS55" };

  it("accepts only the exact code confirmed by the audited RPC", async () => {
    rpc.mockResolvedValueOnce({ data: [{ model_code: "SS55" }], error: null });

    await expect(updateProductModelCode(input)).resolves.toBe("SS55");
    expect(rpc).toHaveBeenCalledWith("update_product_model_code", {
      p_store_id: "store",
      p_model_id: "model",
      p_model_code: "SS55",
    });
  });

  it("does not allow the UI to report success when the RPC has no matching saved code", async () => {
    rpc.mockResolvedValueOnce({ data: [{ model_code: "OLD" }], error: null });

    await expect(updateProductModelCode(input)).rejects.toThrow("not confirmed");
  });
});
