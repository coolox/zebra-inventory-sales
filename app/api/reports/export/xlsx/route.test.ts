import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { inspectOwnerReportXlsx } from "@/features/reports/export/xlsx";
import { GET } from "./route";

const getUser = vi.fn(); const maybeSingle = vi.fn(); const eq = vi.fn(() => ({ eq, maybeSingle })); const select = vi.fn(() => ({ eq, maybeSingle })); const from = vi.fn(() => ({ select })); const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser }, from, rpc }) }));
const request = () => new NextRequest("http://localhost/api/reports/export/xlsx?storeId=store&from=2026-08-01&to=2026-08-31&dimension=seller");

describe("report XLSX API", () => {
  beforeEach(() => { vi.clearAllMocks(); eq.mockReturnValue({ eq, maybeSingle }); select.mockReturnValue({ eq, maybeSingle }); });
  it("rejects unauthenticated and non-Owner callers before running reports", async () => { getUser.mockResolvedValue({ data: { user: null } }); expect((await GET(request())).status).toBe(401); getUser.mockResolvedValue({ data: { user: { id: "seller" } } }); maybeSingle.mockResolvedValue({ data: { role: "seller" } }); expect((await GET(request())).status).toBe(403); expect(rpc).not.toHaveBeenCalled(); });
  it("returns a typed XLSX workbook for an active Owner", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "owner" } } }); maybeSingle.mockResolvedValue({ data: { role: "owner", stores: { name: "Zebra Boutique" } } }); rpc.mockResolvedValueOnce({ data: [{ revenue_eur: 100, cost_eur: 40, margin_eur: 60, sale_count: 1, units: 2, average_ticket_eur: 100 }], error: null }).mockResolvedValueOnce({ data: [{ dimension_key: "seller", dimension_label: "Elif", revenue_eur: 100, cost_eur: 40, margin_eur: 60, units: 2 }], error: null });
    const response = await GET(request()); const files = inspectOwnerReportXlsx(new Uint8Array(await response.arrayBuffer()));
    expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("spreadsheetml"); expect(files["xl/worksheets/sheet1.xml"]).toContain('<c r="B10" s="5"><v>100</v>'); expect(files["xl/worksheets/sheet2.xml"]).toContain("Elif");
  });
});
