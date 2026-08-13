import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadMetrics } from "./load-metrics";

const rpc = vi.fn();

vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc }) }));

describe("loadMetrics", () => {
  beforeEach(() => rpc.mockReset());

  it("maps the EUR snapshot returned by the store-scoped reporting RPC", async () => {
    rpc.mockResolvedValue({ data: [{ revenue_eur: "180.00", cost_eur: "90.00", margin_eur: "90.00", sale_count: "2", units: "5", average_ticket_eur: "90.00" }], error: null });
    const period = { preset: "week", from: "2026-08-05", to: "2026-08-11" } as const;
    await expect(loadMetrics("store-1", period)).resolves.toEqual({ revenueEur: 180, costEur: 90, marginEur: 90, saleCount: 2, units: 5, averageTicketEur: 90 });
    expect(rpc).toHaveBeenCalledWith("get_reporting_metrics", { p_store_id: "store-1", p_from: "2026-08-05", p_to: "2026-08-11" });
  });

  it("does not invent metrics for a rejected or empty RPC response", async () => {
    const error = new Error("RLS denied");
    rpc.mockResolvedValue({ data: null, error });
    const period = { preset: "today", from: "2026-08-11", to: "2026-08-11" } as const;
    await expect(loadMetrics("store-1", period)).rejects.toBe(error);
    rpc.mockResolvedValue({ data: [], error: null });
    await expect(loadMetrics("store-1", period)).rejects.toThrow("unavailable");
  });
});
