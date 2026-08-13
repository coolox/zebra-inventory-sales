import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createOwnerReportPdf } from "./pdf";

const metrics = { revenueEur: 12840, costEur: 6100, marginEur: 6740, saleCount: 84, units: 126, averageTicketEur: 152.86 };
const report = (breakdowns: number) => ({ storeName: "Zebra Boutique", from: "2026-08-01", to: "2026-08-31", generatedAt: new Date("2026-08-13T09:30:00Z"), dimension: "seller", metrics, breakdowns: Array.from({ length: breakdowns }, (_, index) => ({ key: String(index), label: `Seller ${index + 1} with a deliberately long name`, revenueEur: 100 + index, costEur: 40 + index, marginEur: 60, units: index + 1 })) });

describe("createOwnerReportPdf", () => {
  it("paginates a long report and writes a PDF fixture for visual QA", async () => {
    const pdf = await createOwnerReportPdf(report(52));
    const document = await PDFDocument.load(pdf);
    expect(document.getPageCount()).toBeGreaterThan(1);
    await mkdir("tmp/pdfs", { recursive: true });
    await writeFile("tmp/pdfs/report-pdf-visual-qa.pdf", pdf);
  });

  it("keeps an empty report readable", async () => {
    const pdf = await createOwnerReportPdf(report(0));
    const document = await PDFDocument.load(pdf);
    expect(document.getPageCount()).toBe(1);
    expect(document.getTitle()).toContain("Zebra Retail Owner report");
    await mkdir("tmp/pdfs", { recursive: true });
    await writeFile("tmp/pdfs/report-pdf-empty-visual-qa.pdf", pdf);
  });
});
