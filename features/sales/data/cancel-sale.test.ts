import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelSale } from "./cancel-sale";

const rpc = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc }) }));

describe("cancelSale", () => {
  beforeEach(() => { rpc.mockReset(); rpc.mockResolvedValue({ error: null }); });

  it("sends a trimmed reason to the cancellation RPC", async () => {
    await cancelSale({ storeId: "store-1", saleId: "sale-1", reason: "  Customer return ", locale: "en" });
    expect(rpc).toHaveBeenCalledWith("cancel_sale", { p_store_id: "store-1", p_sale_id: "sale-1", p_reason: "Customer return" });
  });

  it("does not call the RPC without a reason", async () => {
    await expect(cancelSale({ storeId: "store-1", saleId: "sale-1", reason: " ", locale: "en" })).rejects.toThrow("reason");
    expect(rpc).not.toHaveBeenCalled();
  });
});
