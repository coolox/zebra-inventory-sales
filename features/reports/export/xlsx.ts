import ExcelJS from "exceljs";
import type { ReportingBreakdown } from "../data/load-breakdowns";
import type { ReportingMetrics } from "../data/load-metrics";

export type OwnerReportXlsx = {
  storeName: string;
  from: string;
  to: string;
  generatedAt: Date;
  dimension: string;
  metrics: ReportingMetrics;
  breakdowns: ReportingBreakdown[];
};

const moneyFormat = '€#,##0.00;[Red]-€#,##0.00';
const dateFormat = "yyyy-mm-dd";
const titleFill = "2B1B4F";
const headingFill = "EDE9FE";

const asDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const safeText = (value: string) => /^[=+\-@]/.test(value) ? `'${value}` : value;

function styleTitle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: titleFill } };
  cell.alignment = { vertical: "middle" };
}

function styleHeading(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FF1F2937" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headingFill } };
  row.alignment = { vertical: "middle" };
}

/** Creates a typed, Owner-report workbook suitable for Excel and LibreOffice. */
export async function createOwnerReportXlsx(report: OwnerReportXlsx): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Zebra Retail";
  workbook.created = report.generatedAt;
  workbook.modified = report.generatedAt;

  const summary = workbook.addWorksheet("Summary", { views: [{ state: "frozen", ySplit: 5 }] });
  summary.mergeCells("A1:B1");
  summary.getCell("A1").value = "ZEBRA RETAIL · OWNER REPORT";
  styleTitle(summary.getCell("A1"));
  summary.getRow(1).height = 26;
  summary.getCell("A3").value = "Store"; summary.getCell("B3").value = safeText(report.storeName);
  summary.getCell("A4").value = "Period from"; summary.getCell("B4").value = asDate(report.from); summary.getCell("B4").numFmt = dateFormat;
  summary.getCell("A5").value = "Period to"; summary.getCell("B5").value = asDate(report.to); summary.getCell("B5").numFmt = dateFormat;
  summary.getCell("A6").value = "Generated at"; summary.getCell("B6").value = report.generatedAt; summary.getCell("B6").numFmt = "yyyy-mm-dd hh:mm";
  summary.getCell("A7").value = "Breakdown"; summary.getCell("B7").value = safeText(report.dimension);
  ["A3", "A4", "A5", "A6", "A7"].forEach((address) => { summary.getCell(address).font = { bold: true }; });
  summary.addRow([]);
  const metricsHeading = summary.addRow(["Metric", "Value"]); styleHeading(metricsHeading);
  const metricRows: [string, number, string][] = [
    ["Revenue", report.metrics.revenueEur, moneyFormat],
    ["Cost", report.metrics.costEur, moneyFormat],
    ["Margin", report.metrics.marginEur, moneyFormat],
    ["Tickets", report.metrics.saleCount, "#,##0"],
    ["Units", report.metrics.units, "#,##0"],
    ["Average ticket", report.metrics.averageTicketEur, moneyFormat],
  ];
  metricRows.forEach(([label, value, format]) => { const row = summary.addRow([label, value]); row.getCell(2).numFmt = format; });
  summary.columns = [{ width: 24 }, { width: 22 }];

  const breakdown = workbook.addWorksheet("Breakdown", { views: [{ state: "frozen", ySplit: 5 }] });
  breakdown.mergeCells("A1:F1");
  breakdown.getCell("A1").value = `BREAKDOWN · ${safeText(report.dimension).toUpperCase()}`;
  styleTitle(breakdown.getCell("A1"));
  breakdown.getRow(1).height = 26;
  breakdown.getCell("A3").value = "Store"; breakdown.getCell("B3").value = safeText(report.storeName);
  breakdown.getCell("D3").value = "Period from"; breakdown.getCell("E3").value = asDate(report.from); breakdown.getCell("E3").numFmt = dateFormat;
  breakdown.getCell("A4").value = "Period to"; breakdown.getCell("B4").value = asDate(report.to); breakdown.getCell("B4").numFmt = dateFormat;
  ["A3", "D3", "A4"].forEach((address) => { breakdown.getCell(address).font = { bold: true }; });
  const heading = breakdown.addRow(["Key", "Label", "Revenue (EUR)", "Cost (EUR)", "Margin (EUR)", "Units"]); styleHeading(heading);
  report.breakdowns.forEach((item) => {
    const row = breakdown.addRow([safeText(item.key), safeText(item.label), item.revenueEur, item.costEur, item.marginEur, item.units]);
    [3, 4, 5].forEach((column) => { row.getCell(column).numFmt = moneyFormat; });
    row.getCell(6).numFmt = "#,##0";
  });
  if (!report.breakdowns.length) {
    const row = breakdown.addRow(["", "No report data for this period."]);
    row.font = { italic: true, color: { argb: "FF6B7280" } };
  }
  breakdown.columns = [{ width: 20 }, { width: 34 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 12 }];
  breakdown.autoFilter = { from: "A5", to: "F5" };

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
