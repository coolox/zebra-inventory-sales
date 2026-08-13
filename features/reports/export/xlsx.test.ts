import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { createOwnerReportXlsx } from "./xlsx";

const report = {
  storeName: "Zebra Boutique", from: "2026-08-01", to: "2026-08-31", generatedAt: new Date("2026-08-13T09:30:00.000Z"), dimension: "seller",
  metrics: { revenueEur: 120, costEur: 55, marginEur: 65, saleCount: 1, units: 2, averageTicketEur: 120 },
  breakdowns: [{ key: "seller-1", label: "=Elif", revenueEur: 120, costEur: 55, marginEur: 65, units: 2 }],
};

describe("createOwnerReportXlsx", () => {
  it("creates typed summary and requested breakdown worksheets", async () => {
    const buffer = await createOwnerReportXlsx(report); const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(buffer);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(["Summary", "Breakdown"]);
    const summary = workbook.getWorksheet("Summary")!; const breakdown = workbook.getWorksheet("Breakdown")!;
    expect(summary.getCell("B4").value).toBeInstanceOf(Date);
    expect(summary.getCell("B10").value).toBe(120);
    expect(summary.getCell("B10").numFmt).toContain("€");
    expect(breakdown.getCell("C6").value).toBe(120);
    expect(breakdown.getCell("C6").numFmt).toContain("€");
    expect(breakdown.getCell("B6").value).toBe("'=Elif");
    expect(breakdown.autoFilter).toBeTruthy();
  });
});
