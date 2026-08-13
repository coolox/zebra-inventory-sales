import { describe, expect, it } from "vitest";
import { createOwnerReportXlsx, inspectOwnerReportXlsx } from "./xlsx";

const report = { storeName: "Zebra Boutique", from: "2026-08-01", to: "2026-08-31", generatedAt: new Date("2026-08-13T09:30:00.000Z"), dimension: "seller", metrics: { revenueEur: 120, costEur: 55, marginEur: 65, saleCount: 1, units: 2, averageTicketEur: 120 }, breakdowns: [{ key: "seller-1", label: "=Elif", revenueEur: 120, costEur: 55, marginEur: 65, units: 2 }] };

describe("createOwnerReportXlsx", () => {
  it("creates typed summary and requested breakdown worksheets", async () => {
    const files = inspectOwnerReportXlsx(await createOwnerReportXlsx(report));
    expect(files["xl/workbook.xml"]).toContain('sheet name="Summary"'); expect(files["xl/workbook.xml"]).toContain('sheet name="Breakdown"');
    expect(files["xl/worksheets/sheet1.xml"]).toContain('<c r="B4" s="3"><v>'); expect(files["xl/worksheets/sheet1.xml"]).toContain('<c r="B10" s="5"><v>120</v>');
    expect(files["xl/worksheets/sheet2.xml"]).toContain('<c r="C6" s="5"><v>120</v>'); expect(files["xl/worksheets/sheet2.xml"]).toContain("&apos;=Elif"); expect(files["xl/worksheets/sheet2.xml"]).toContain('<autoFilter ref="A5:F5"/>');
  });
});
