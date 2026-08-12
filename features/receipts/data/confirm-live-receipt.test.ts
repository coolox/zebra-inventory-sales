import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmLiveReceipt } from "./confirm-live-receipt";

const rpc = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ rpc }),
}));

const line = {
  code: "TR-07",
  barcode: "869000700001",
  name: "Structured Jacket",
  brand: "Balmain",
  category: "Jackets",
  gender: "women",
  color: "Black",
  size: "M",
  cost: 120,
  currency: "EUR",
  stock: 2,
  supplier: "SUSI",
  store: "clothing",
} as const;

describe("confirmLiveReceipt", () => {
  beforeEach(() => {
    rpc.mockReset();
    rpc.mockResolvedValue({ error: null });
    vi.stubGlobal("crypto", { randomUUID: () => "test-idempotency-key" });
  });

  it("maps a receipt draft to the inventory RPC payload", async () => {
    await confirmLiveReceipt({ storeId: "store-1", lines: [line], locale: "en" });

    expect(rpc).toHaveBeenCalledWith("confirm_inventory_receipt", {
      p_store_id: "store-1",
      p_model: {
        model_code: "TR-07",
        name: "Structured Jacket",
        brand: "Balmain",
        category: "Jackets",
        gender: "women",
        supplier_name: "SUSI",
        barcode: "869000700001",
      },
      p_lines: [{ color: "Black", size: "M", quantity: 2, unit_cost: 120, currency: "EUR" }],
      p_idempotency_key: "test-idempotency-key",
    });
  });

  it("maps multiple size, color and currency lines without losing native values", async () => {
    await confirmLiveReceipt({
      storeId: "store-1",
      lines: [line, { ...line, color: "Ivory", size: "L", stock: 3, cost: 95, currency: "USD" }],
      locale: "en",
    });

    expect(rpc).toHaveBeenCalledWith("confirm_inventory_receipt", expect.objectContaining({
      p_lines: [
        { color: "Black", size: "M", quantity: 2, unit_cost: 120, currency: "EUR" },
        { color: "Ivory", size: "L", quantity: 3, unit_cost: 95, currency: "USD" },
      ],
    }));
  });

  it("rejects a missing store membership before calling the RPC", async () => {
    await expect(confirmLiveReceipt({ storeId: "", lines: [line], locale: "tr" })).rejects.toThrow("Mağaza yetkilendirmesi bulunamadı.");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not call the RPC for an empty receipt", async () => {
    await confirmLiveReceipt({ storeId: "store-1", lines: [], locale: "en" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("localizes RPC errors", async () => {
    rpc.mockResolvedValue({ error: { message: "Owner must set the USD exchange rate before receiving stock" } });

    await expect(confirmLiveReceipt({ storeId: "store-1", lines: [line], locale: "tr" })).rejects.toThrow("bugünün döviz kuru");
  });
});
