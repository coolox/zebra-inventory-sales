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

const encoder = new TextEncoder();
const xml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const safeText = (value: string) => /^[=+\-@]/.test(value) ? `'${value}` : value;
const column = (index: number) => String.fromCharCode(64 + index);
const excelDate = (value: Date) => (value.getTime() - Date.UTC(1899, 11, 30)) / 86_400_000;

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) { let value = index; for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1; table[index] = value >>> 0; }
  return table;
})();
const crc32 = (data: Uint8Array) => { let value = 0xffffffff; for (const byte of data) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8); return (value ^ 0xffffffff) >>> 0; };
const u16 = (value: number) => Uint8Array.of(value & 255, (value >>> 8) & 255);
const u32 = (value: number) => Uint8Array.of(value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255);
const join = (parts: Uint8Array[]) => { const size = parts.reduce((sum, part) => sum + part.length, 0); const result = new Uint8Array(size); let offset = 0; parts.forEach((part) => { result.set(part, offset); offset += part.length; }); return result; };

/** Writes a minimal standards-compliant ZIP package; entries are intentionally stored rather than compressed. */
function zip(files: Record<string, string>) {
  const local: Uint8Array[] = []; const central: Uint8Array[] = []; let offset = 0; const entries = Object.entries(files);
  entries.forEach(([name, source]) => {
    const filename = encoder.encode(name); const data = encoder.encode(source); const crc = crc32(data);
    const header = join([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(filename.length), u16(0), filename, data]);
    local.push(header);
    central.push(join([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(filename.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), filename]));
    offset += header.length;
  });
  const centralBytes = join(central); const locals = join(local);
  return Buffer.from(join([locals, centralBytes, u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(centralBytes.length), u32(locals.length), u16(0)]));
}

function inline(address: string, value: string, style = 0) { return `<c r="${address}"${style ? ` s="${style}"` : ""} t="inlineStr"><is><t xml:space="preserve">${xml(safeText(value))}</t></is></c>`; }
function numeric(address: string, value: number, style: number) { return `<c r="${address}" s="${style}"><v>${Number.isFinite(value) ? value : 0}</v></c>`; }
function row(index: number, cells: string[]) { return `<row r="${index}">${cells.join("")}</row>`; }
function sheetXml(rows: string[], dimensions: string, merges: string[] = [], filter?: string) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="5" topLeftCell="A6" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="24" customWidth="1"/><col min="2" max="2" width="34" customWidth="1"/><col min="3" max="5" width="18" customWidth="1"/><col min="6" max="6" width="12" customWidth="1"/></cols><sheetData>${rows.join("")}</sheetData>${merges.length ? `<mergeCells count="${merges.length}">${merges.map((ref) => `<mergeCell ref="${ref}"/>`).join("")}</mergeCells>` : ""}${filter ? `<autoFilter ref="${filter}"/>` : ""}<dimension ref="${dimensions}"/></worksheet>`;
}

const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="3"><numFmt numFmtId="164" formatCode="yyyy-mm-dd"/><numFmt numFmtId="165" formatCode="yyyy-mm-dd hh:mm"/><numFmt numFmtId="166" formatCode="€#,##0.00;[Red]-€#,##0.00"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="14"/><name val="Calibri"/></font><font><b/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2B1B4F"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="1" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`;

/** Creates a typed Owner report workbook without a third-party production dependency. */
export async function createOwnerReportXlsx(report: OwnerReportXlsx): Promise<Buffer> {
  const summaryRows = [
    row(1, [inline("A1", "ZEBRA RETAIL · OWNER REPORT", 1)]),
    row(3, [inline("A3", "Store", 2), inline("B3", report.storeName)]),
    row(4, [inline("A4", "Period from", 2), numeric("B4", excelDate(new Date(`${report.from}T00:00:00.000Z`)), 3)]),
    row(5, [inline("A5", "Period to", 2), numeric("B5", excelDate(new Date(`${report.to}T00:00:00.000Z`)), 3)]),
    row(6, [inline("A6", "Generated at", 2), numeric("B6", excelDate(report.generatedAt), 4)]),
    row(7, [inline("A7", "Breakdown", 2), inline("B7", report.dimension)]),
    row(9, [inline("A9", "Metric", 2), inline("B9", "Value", 2)]),
    ...[["Revenue", report.metrics.revenueEur, 5], ["Cost", report.metrics.costEur, 5], ["Margin", report.metrics.marginEur, 5], ["Tickets", report.metrics.saleCount, 6], ["Units", report.metrics.units, 6], ["Average ticket", report.metrics.averageTicketEur, 5]].map(([label, value, style], index) => row(index + 10, [inline(`A${index + 10}`, String(label)), numeric(`B${index + 10}`, Number(value), Number(style))])),
  ];
  const breakdownRows = [
    row(1, [inline("A1", `BREAKDOWN · ${report.dimension.toUpperCase()}`, 1)]),
    row(3, [inline("A3", "Store", 2), inline("B3", report.storeName), inline("D3", "Period from", 2), numeric("E3", excelDate(new Date(`${report.from}T00:00:00.000Z`)), 3)]),
    row(4, [inline("A4", "Period to", 2), numeric("B4", excelDate(new Date(`${report.to}T00:00:00.000Z`)), 3)]),
    row(5, ["Key", "Label", "Revenue (EUR)", "Cost (EUR)", "Margin (EUR)", "Units"].map((value, index) => inline(`${column(index + 1)}5`, value, 2))),
    ...(report.breakdowns.length ? report.breakdowns.map((item, index) => row(index + 6, [inline(`A${index + 6}`, item.key), inline(`B${index + 6}`, item.label), numeric(`C${index + 6}`, item.revenueEur, 5), numeric(`D${index + 6}`, item.costEur, 5), numeric(`E${index + 6}`, item.marginEur, 5), numeric(`F${index + 6}`, item.units, 6)])) : [row(6, [inline("B6", "No report data for this period.")])]),
  ];
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Summary" sheetId="1" r:id="rId1"/><sheet name="Breakdown" sheetId="2" r:id="rId2"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    "xl/styles.xml": styles,
    "xl/worksheets/sheet1.xml": sheetXml(summaryRows, "A1:B15", ["A1:B1"]),
    "xl/worksheets/sheet2.xml": sheetXml(breakdownRows, `A1:F${Math.max(6, report.breakdowns.length + 5)}`, ["A1:F1"], "A5:F5"),
  };
  return zip(files);
}

/** Test-only structural inspection for the uncompressed XLSX package produced above. */
export function inspectOwnerReportXlsx(buffer: Uint8Array) {
  const files: Record<string, string> = {}; let offset = 0; const decoder = new TextDecoder();
  while (offset + 30 <= buffer.length && new DataView(buffer.buffer, buffer.byteOffset + offset).getUint32(0, true) === 0x04034b50) {
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset); const size = view.getUint32(18, true); const nameSize = view.getUint16(26, true); const extraSize = view.getUint16(28, true); const nameStart = offset + 30; const dataStart = nameStart + nameSize + extraSize;
    files[decoder.decode(buffer.slice(nameStart, nameStart + nameSize))] = decoder.decode(buffer.slice(dataStart, dataStart + size)); offset = dataStart + size;
  }
  return files;
}
