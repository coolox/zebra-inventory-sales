import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ReportingBreakdown } from "../data/load-breakdowns";
import type { ReportingMetrics } from "../data/load-metrics";

export type OwnerReportPdf = {
  storeName: string;
  from: string;
  to: string;
  generatedAt: Date;
  dimension: string;
  metrics: ReportingMetrics;
  breakdowns: ReportingBreakdown[];
  cashRows?: { method: string; currency: string; count: number; amount: number }[];
};

const pageWidth = 841.89;
const pageHeight = 595.28;
const margin = 36;
const tableTop = 246;
const tableBottom = 44;
const rowHeight = 19;
const columns = [36, 274, 379, 484, 589, 699] as const;
const ink = rgb(0.12, 0.13, 0.16);
const muted = rgb(0.36, 0.38, 0.43);
const violet = rgb(0.36, 0.24, 0.68);
const line = rgb(0.83, 0.84, 0.87);

const money = (value: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
const number = (value: number) => new Intl.NumberFormat("en-IE", { maximumFractionDigits: 0 }).format(value);
const dateTime = (value: Date) => `${value.toISOString().slice(0, 16).replace("T", " ")} UTC`;

function truncate(font: PDFFont, value: string, maxWidth: number, size: number) {
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;
  let text = value;
  while (text.length > 1 && font.widthOfTextAtSize(`${text}…`, size) > maxWidth) text = text.slice(0, -1);
  return `${text}…`;
}

function text(page: PDFPage, font: PDFFont, value: string, x: number, y: number, size: number, color = ink) {
  page.drawText(value, { x, y, size, font, color });
}

function reportHeader(page: PDFPage, regular: PDFFont, bold: PDFFont, report: OwnerReportPdf, continuation = false) {
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: pageHeight - 8, width: pageWidth, height: 8, color: violet });
  text(page, bold, "ZEBRA RETAIL", margin, 541, 17);
  text(page, regular, continuation ? "Owner report · continued" : "Owner report", margin, 518, 10, muted);
  text(page, bold, report.storeName, margin, 485, 13);
  text(page, regular, `Period: ${report.from} — ${report.to}`, margin, 465, 10, muted);
  text(page, regular, `Generated: ${dateTime(report.generatedAt)}`, 592, 485, 9, muted);
  text(page, regular, `Breakdown: ${report.dimension}`, 592, 465, 9, muted);
}

function summary(page: PDFPage, regular: PDFFont, bold: PDFFont, metrics: ReportingMetrics) {
  const items = [["Revenue", money(metrics.revenueEur)], ["Cost", money(metrics.costEur)], ["Margin", money(metrics.marginEur)], ["Tickets", number(metrics.saleCount)], ["Units", number(metrics.units)], ["Average ticket", money(metrics.averageTicketEur)]];
  items.forEach(([label, value], index) => {
    const x = margin + index * 127;
    page.drawRectangle({ x, y: 385, width: 117, height: 53, borderColor: line, borderWidth: 0.7 });
    text(page, regular, label, x + 9, 421, 8, muted);
    text(page, bold, value, x + 9, 400, 11);
  });
}

function tableHeader(page: PDFPage, bold: PDFFont, dimension: string) {
  page.drawLine({ start: { x: margin, y: tableTop + 3 }, end: { x: pageWidth - margin, y: tableTop + 3 }, thickness: 0.8, color: line });
  [dimension, "Revenue", "Cost", "Margin", "Units"].forEach((value, index) => text(page, bold, value, columns[index], tableTop - 12, 8, muted));
  page.drawLine({ start: { x: margin, y: tableTop - 18 }, end: { x: pageWidth - margin, y: tableTop - 18 }, thickness: 0.8, color: line });
}

function tableRow(page: PDFPage, regular: PDFFont, row: ReportingBreakdown, y: number) {
  text(page, regular, truncate(regular, row.label, 225, 9), columns[0], y, 9);
  text(page, regular, money(row.revenueEur), columns[1], y, 9);
  text(page, regular, money(row.costEur), columns[2], y, 9);
  text(page, regular, money(row.marginEur), columns[3], y, 9);
  text(page, regular, number(row.units), columns[4], y, 9);
  page.drawLine({ start: { x: margin, y: y - 6 }, end: { x: pageWidth - margin, y: y - 6 }, thickness: 0.35, color: line });
}

function cashTableHeader(page: PDFPage, bold: PDFFont) {
  text(page, bold, "Captured ledger payments (not a physical cash count)", margin, tableTop + 22, 10, muted);
  page.drawLine({ start: { x: margin, y: tableTop + 3 }, end: { x: pageWidth - margin, y: tableTop + 3 }, thickness: 0.8, color: line });
  ["Method", "Currency", "Payment count", "Amount"].forEach((value, index) => text(page, bold, value, columns[index], tableTop - 12, 8, muted));
  page.drawLine({ start: { x: margin, y: tableTop - 18 }, end: { x: pageWidth - margin, y: tableTop - 18 }, thickness: 0.8, color: line });
}

function cashTableRow(page: PDFPage, regular: PDFFont, row: NonNullable<OwnerReportPdf["cashRows"]>[number], y: number) {
  text(page, regular, row.method, columns[0], y, 9);
  text(page, regular, row.currency, columns[1], y, 9);
  text(page, regular, number(row.count), columns[2], y, 9);
  text(page, regular, new Intl.NumberFormat("en-IE", { style: "currency", currency: row.currency, maximumFractionDigits: 2 }).format(row.amount), columns[3], y, 9);
  page.drawLine({ start: { x: margin, y: y - 6 }, end: { x: pageWidth - margin, y: y - 6 }, thickness: 0.35, color: line });
}

/** Produces a compact, paginated Owner report; it deliberately has no receipt semantics. */
export async function createOwnerReportPdf(report: OwnerReportPdf) {
  const document = await PDFDocument.create();
  document.setTitle(`Zebra Retail Owner report ${report.from} to ${report.to}`);
  document.setAuthor("Zebra Retail");
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  let page = document.addPage([pageWidth, pageHeight]);
  reportHeader(page, regular, bold, report);
  summary(page, regular, bold, report.metrics);
  tableHeader(page, bold, report.dimension);
  let y = tableTop - 35;

  if (!report.breakdowns.length) text(page, regular, "No report data for this period.", margin, y, 10, muted);
  for (const row of report.breakdowns) {
    if (y - rowHeight < tableBottom) {
      page = document.addPage([pageWidth, pageHeight]);
      reportHeader(page, regular, bold, report, true);
      tableHeader(page, bold, report.dimension);
      y = tableTop - 35;
    }
    tableRow(page, regular, row, y);
    y -= rowHeight;
  }
  if (report.cashRows) {
    page = document.addPage([pageWidth, pageHeight]);
    reportHeader(page, regular, bold, report, true);
    cashTableHeader(page, bold);
    y = tableTop - 35;
    if (!report.cashRows.length) text(page, regular, "No captured payments for this period.", margin, y, 10, muted);
    for (const cashRow of report.cashRows) {
      if (y - rowHeight < tableBottom) {
        page = document.addPage([pageWidth, pageHeight]);
        reportHeader(page, regular, bold, report, true);
        cashTableHeader(page, bold);
        y = tableTop - 35;
      }
      cashTableRow(page, regular, cashRow, y);
      y -= rowHeight;
    }
  }
  return document.save();
}
