import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const getUser = vi.fn(); const maybeSingle = vi.fn(); const eq = vi.fn(() => ({ eq, maybeSingle })); const select = vi.fn(() => ({ eq, maybeSingle })); const from = vi.fn(() => ({ select })); const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser }, from, rpc }) }));
const request = () => new NextRequest("http://localhost/api/reports/export/csv?storeId=store&from=2026-08-01&to=2026-08-31&report=breakdown&dimension=seller");
describe("report CSV API", () => {
  beforeEach(() => { vi.clearAllMocks(); eq.mockReturnValue({ eq, maybeSingle }); select.mockReturnValue({ eq, maybeSingle }); });
  it("rejects unauthenticated and non-Owner callers before running a report", async () => { getUser.mockResolvedValue({ data: { user: null } }); expect((await GET(request())).status).toBe(401); getUser.mockResolvedValue({ data: { user: { id: "seller" } } }); maybeSingle.mockResolvedValue({ data: { role: "seller" } }); expect((await GET(request())).status).toBe(403); expect(rpc).not.toHaveBeenCalled(); });
  it("returns a UTF-8 CSV for an active Owner", async () => { getUser.mockResolvedValue({ data: { user: { id: "owner" } } }); maybeSingle.mockResolvedValue({ data: { role: "owner" } }); rpc.mockResolvedValue({ data: [{ dimension_key: "1", dimension_label: "=Elif", revenue_eur: 10, cost_eur: 4, margin_eur: 6, units: 1 }], error: null }); const response = await GET(request()); expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("text/csv"); expect(await response.text()).toContain("'=Elif"); });
});
