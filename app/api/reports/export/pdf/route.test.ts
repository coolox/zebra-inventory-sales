import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const getUser = vi.fn(); const maybeSingle = vi.fn(); const eq = vi.fn(() => ({ eq, maybeSingle })); const select = vi.fn(() => ({ eq, maybeSingle })); const from = vi.fn(() => ({ select })); const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser }, from, rpc }) }));
const request = () => new NextRequest("http://localhost/api/reports/export/pdf?storeId=store&from=2026-08-01&to=2026-08-31&dimension=seller");

describe("report PDF API", () => {
  beforeEach(() => { vi.clearAllMocks(); eq.mockReturnValue({ eq, maybeSingle }); select.mockReturnValue({ eq, maybeSingle }); });
  it("rejects unauthenticated and non-Owner callers before running reports", async () => {
    getUser.mockResolvedValue({ data: { user: null } }); expect((await GET(request())).status).toBe(401);
    getUser.mockResolvedValue({ data: { user: { id: "seller" } } }); maybeSingle.mockResolvedValue({ data: { role: "seller" } }); expect((await GET(request())).status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns a compact PDF for an active Owner", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "owner" } } }); maybeSingle.mockResolvedValue({ data: { role: "owner", stores: { name: "Zebra Boutique" } } });
    rpc.mockResolvedValueOnce({ data: [{ revenue_eur: 100, cost_eur: 40, margin_eur: 60, sale_count: 1, units: 2, average_ticket_eur: 100 }], error: null }).mockResolvedValueOnce({ data: [{ dimension_key: "seller", dimension_label: "Elif", revenue_eur: 100, cost_eur: 40, margin_eur: 60, units: 2 }], error: null });
    const response = await GET(request());
    expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("application/pdf"); expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1000);
  });
});
