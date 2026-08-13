import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadInventoryReport } from "./load-inventory-report";
const rpc = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc }) }));
describe("loadInventoryReport", () => {
  beforeEach(() => rpc.mockReset());
  it("maps ledger-derived metrics and forwards the common date contract", async () => {
    rpc.mockResolvedValue({ data: [{ model_id: "model", model_code: "KM-1", model_name: "Dress", variant_id: "variant", color: "Black", size: "M", balance: "2", sold_units: "3", sell_through: "0.6", turnover: "1.5", low_stock_threshold: "2", is_low_stock: true }], error: null });
    await expect(loadInventoryReport("store", { preset: "week", from: "2026-08-05", to: "2026-08-11" })).resolves.toMatchObject([{ balance: 2, soldUnits: 3, sellThrough: .6, turnover: 1.5, isLowStock: true }]);
    expect(rpc).toHaveBeenCalledWith("get_inventory_report", { p_store_id: "store", p_from: "2026-08-05", p_to: "2026-08-11" });
  });
  it("preserves empty and error states", async () => { rpc.mockResolvedValue({ data: [], error: null }); await expect(loadInventoryReport("store", { preset: "today", from: "2026-08-11", to: "2026-08-11" })).resolves.toEqual([]); });
});
