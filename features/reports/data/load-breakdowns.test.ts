import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadBreakdowns } from "./load-breakdowns";

const rpc = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc }) }));

describe("loadBreakdowns", () => {
  beforeEach(() => rpc.mockReset());
  it("maps dimension rows and forwards the shared inclusive range", async () => {
    rpc.mockResolvedValue({ data: [{ dimension_key: "seller-1", dimension_label: "Elif", revenue_eur: "120", cost_eur: "60", margin_eur: "60", units: "2" }], error: null });
    await expect(loadBreakdowns("store-1", { preset: "week", from: "2026-08-05", to: "2026-08-11" }, "seller")).resolves.toEqual([{ key: "seller-1", label: "Elif", revenueEur: 120, costEur: 60, marginEur: 60, units: 2 }]);
    expect(rpc).toHaveBeenCalledWith("get_reporting_breakdown", { p_store_id: "store-1", p_from: "2026-08-05", p_to: "2026-08-11", p_dimension: "seller" });
  });
  it("keeps an empty result empty and surfaces RPC errors", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    await expect(loadBreakdowns("store-1", { preset: "today", from: "2026-08-11", to: "2026-08-11" }, "brand")).resolves.toEqual([]);
    const error = new Error("RLS denied"); rpc.mockResolvedValue({ data: null, error });
    await expect(loadBreakdowns("store-1", { preset: "today", from: "2026-08-11", to: "2026-08-11" }, "brand")).rejects.toBe(error);
  });
});
