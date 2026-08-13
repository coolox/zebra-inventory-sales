import { describe, expect, it, vi } from "vitest";
import { loadDiscrepancies } from "./load-discrepancies";

const rpc = vi.fn(); vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc }) }));
describe("loadDiscrepancies", () => {
  it("normalizes typed values and propagates RPC failures", async () => {
    rpc.mockResolvedValueOnce({ data: [{ discrepancy_type: "payment_mismatch", severity: "error", source_ids: { sale_id: "sale" }, expected_value: "10.00", actual_value: "9.00", occurred_at: "2026-08-13T00:00:00Z", summary: "Mismatch" }], error: null });
    await expect(loadDiscrepancies("store")).resolves.toEqual([expect.objectContaining({ expectedValue: 10, actualValue: 9, sourceIds: { sale_id: "sale" } })]);
    rpc.mockResolvedValueOnce({ data: null, error: new Error("forbidden") }); await expect(loadDiscrepancies("store")).rejects.toThrow("forbidden");
  });
});
