import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { ReportingBreakdown, ReportingDimension } from "../data/load-breakdowns";
import type { InventoryReportRow } from "../data/load-inventory-report";
import type { ReportingMetrics } from "../data/load-metrics";
import type { ReconciliationDiscrepancy } from "../data/load-discrepancies";
import { reportPeriod, type ReportPeriod } from "../model/period";
import { DiscrepancyReport } from "./discrepancy-report";
import { LowStockReport } from "./low-stock-report";
import { PeriodFilter } from "./period-filter";
import { loadCashReport, type CashReportRow } from "../data/load-cash-report";

const dimensions: ReportingDimension[] = ["seller", "supplier", "brand", "model", "category"];
type ReportData = { metrics: ReportingMetrics; breakdowns: ReportingBreakdown[]; inventory: InventoryReportRow[] };

const reportCopy = {
  en: { title: "Reports", description: "EUR financial and ledger inventory view", exportCsv: "Export CSV", exportXlsx: "Export XLSX", exportPdf: "Export PDF", loading: "Loading reports…", error: "Reports could not be loaded.", retry: "Retry", revenue: "Revenue", margin: "Margin", tickets: "Tickets", units: "Units", dimensions: { seller: "Seller", supplier: "Supplier", brand: "Brand", model: "Model", category: "Category" }, breakdown: "Breakdown dimension", table: "Report breakdown table", noData: "No report data for this period.", unknownSeller: "Unknown seller", unknownSellerHelp: "No active name or account email is available for this historical sale.", unknown: "Unknown", unassigned: "Unassigned" },
  tr: { title: "Raporlar", description: "EUR finans ve stok hareketleri görünümü", exportCsv: "CSV dışa aktar", exportXlsx: "XLSX dışa aktar", exportPdf: "PDF dışa aktar", loading: "Raporlar yükleniyor…", error: "Raporlar yüklenemedi.", retry: "Tekrar dene", revenue: "Ciro", margin: "Kâr marjı", tickets: "Fişler", units: "Adet", dimensions: { seller: "Satıcı", supplier: "Tedarikçi", brand: "Marka", model: "Model", category: "Kategori" }, breakdown: "Döküm boyutu", table: "Rapor döküm tablosu", noData: "Bu dönem için rapor verisi yok.", unknownSeller: "Bilinmeyen satıcı", unknownSellerHelp: "Bu geçmiş satış için etkin ad veya hesap e-postası yok.", unknown: "Bilinmiyor", unassigned: "Atanmamış" },
} as const;

export function ReportsDashboard({ role, locale, load, loadDiscrepancies, exportStoreId, refreshKey = "" }: { role: "owner" | "seller"; locale: Locale; load: (period: ReportPeriod, dimension: ReportingDimension) => Promise<ReportData>; loadDiscrepancies?: () => Promise<ReconciliationDiscrepancy[]>; exportStoreId?: string; refreshKey?: string }) {
  const [period, setPeriod] = useState(() => reportPeriod("week"));
  const [dimension, setDimension] = useState<ReportingDimension>("seller");
  const [showCash, setShowCash] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [data, setData] = useState<ReportData | null>(null);
  const [cashRows, setCashRows] = useState<CashReportRow[] | null>(null);
  const refresh = () => {
    setState("loading");
    void load(period, dimension).then((next) => { setData(next); setState("ready"); }).catch(() => { setData(null); setState("error"); });
  };
  useEffect(() => { if (role === "owner") refresh(); }, [period, dimension, role, refreshKey]);
  useEffect(() => { if (role === "owner" && exportStoreId) void loadCashReport(exportStoreId, period).then(setCashRows).catch(() => setCashRows(null)); }, [role, exportStoreId, period, refreshKey]);
  if (role !== "owner") return null;

  const text = reportCopy[locale];
  const money = (value: number) => new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
  const labels = locale === "tr" ? { today: "Bugün", week: "Hafta", month: "Ay", year: "Yıl", custom: "Özel", from: "Başlangıç", to: "Bitiş", apply: "Uygula", invalid: "Geçerli tarih aralığı seçin" } : { today: "Today", week: "Week", month: "Month", year: "Year", custom: "Custom", from: "From", to: "To", apply: "Apply", invalid: "Choose a valid date range" };
  const query = `storeId=${encodeURIComponent(exportStoreId ?? "")}&from=${period.from}&to=${period.to}&dimension=${dimension}`;
  const exportHref = exportStoreId ? `/api/reports/export/csv?${query}&report=breakdown` : undefined;
  const cashExportHref = exportStoreId ? `/api/reports/export/csv?storeId=${encodeURIComponent(exportStoreId)}&from=${period.from}&to=${period.to}&report=cash` : undefined;
  const xlsxExportHref = exportStoreId ? `/api/reports/export/xlsx?${query}` : undefined;
  const pdfExportHref = exportStoreId ? `/api/reports/export/pdf?${query}` : undefined;

  return (
    <section id="reports" className="panel mt-4 scroll-mt-24 rounded-2xl p-5 sm:p-6" aria-label={text.title}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-sm font-semibold">{text.title}</h2><p className="mt-1 text-xs text-zinc-500">{text.description}</p></div>
        <div className="flex flex-wrap gap-2">
          <PeriodFilter value={period} onChange={setPeriod} labels={labels} />
          {exportHref && <a href={exportHref} className="rounded-md border border-violet-500/40 px-3 py-2 text-xs font-semibold text-violet-200">{text.exportCsv}</a>}
          {xlsxExportHref && <a href={xlsxExportHref} className="rounded-md border border-violet-500/40 px-3 py-2 text-xs font-semibold text-violet-200">{text.exportXlsx}</a>}
          {pdfExportHref && <a href={pdfExportHref} className="rounded-md border border-violet-500/40 px-3 py-2 text-xs font-semibold text-violet-200">{text.exportPdf}</a>}
        </div>
      </div>
      {state === "loading" && <p className="py-10 text-center text-xs text-zinc-500">{text.loading}</p>}
      {state === "error" && <div className="py-10 text-center text-xs text-red-300">{text.error} <button type="button" onClick={refresh} className="font-semibold underline">{text.retry}</button></div>}
      {state === "ready" && data && <>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[[text.revenue, money(data.metrics.revenueEur)], [text.margin, money(data.metrics.marginEur)], [text.tickets, String(data.metrics.saleCount)], [text.units, String(data.metrics.units)]].map(([label, value]) => <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"><p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>)}
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label={text.breakdown}>
          {dimensions.map((item) => <button key={item} type="button" onClick={() => { setDimension(item); setShowCash(false); }} className={`rounded-md border px-3 py-1.5 text-xs ${!showCash && dimension === item ? "border-violet-500/50 text-violet-200" : "border-zinc-800 text-zinc-500"}`}>{text.dimensions[item]}</button>)}
          <button type="button" onClick={() => setShowCash(true)} aria-pressed={showCash} className={`rounded-md border px-3 py-1.5 text-xs ${showCash ? "border-violet-500/50 text-violet-200" : "border-zinc-800 text-zinc-500"}`}>{locale === "tr" ? "Kasa" : "Cash"}</button>
        </div>
        {showCash ? <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/35 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold">{locale === "tr" ? "Kasa" : "Cash"}</p><p className="mt-1 text-[10px] text-zinc-500">{locale === "tr" ? "Kaydedilen ödemeler; fiziksel kasa sayımı değildir." : "Captured ledger payments; not a physical cash count."}</p></div><div className="flex gap-2"><button type="button" onClick={() => window.print()} className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300">{locale === "tr" ? "Yazdır" : "Print"}</button>{cashExportHref && <a href={cashExportHref} className="rounded-md border border-violet-500/40 px-3 py-1.5 text-xs font-semibold text-violet-200">{text.exportCsv}</a>}</div></div><p className="mt-2 text-[10px] text-zinc-500">{period.from} — {period.to}</p>{cashRows === null ? <p className="mt-3 text-xs text-zinc-500">{locale === "tr" ? "Kasa verisi yüklenemedi." : "Cash data could not be loaded."}</p> : cashRows.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[400px] text-left text-xs"><thead className="text-zinc-500"><tr><th className="p-2">{locale === "tr" ? "Yöntem" : "Method"}</th><th className="p-2">{locale === "tr" ? "Para birimi" : "Currency"}</th><th className="p-2">{locale === "tr" ? "Ödeme" : "Payments"}</th><th className="p-2 text-right">{locale === "tr" ? "Tutar" : "Amount"}</th></tr></thead><tbody>{cashRows.map((row) => <tr key={`${row.method}-${row.currency}`} className="border-t border-zinc-800"><td className="p-2">{row.method === "cash" ? (locale === "tr" ? "Nakit" : "Cash") : row.method === "bank_transfer" ? (locale === "tr" ? "Havale" : "Bank transfer") : (locale === "tr" ? "Kart" : "Card")}</td><td className="p-2">{row.currency}</td><td className="p-2">{row.count}</td><td className="p-2 text-right font-semibold">{new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-IE", { style: "currency", currency: row.currency }).format(row.amount)}</td></tr>)}</tbody></table></div> : <p className="mt-3 text-xs text-zinc-500">{locale === "tr" ? "Bu dönem için kayıtlı ödeme yok." : "No captured payments for this period."}</p>}</div> : <div className="mt-3 overflow-x-auto" tabIndex={0} aria-label={text.table}>
          <table className="w-full min-w-[520px] text-left text-xs"><thead className="text-zinc-500"><tr><th className="p-2">{text.dimensions[dimension]}</th><th className="p-2">{text.revenue}</th><th className="p-2">{text.margin}</th><th className="p-2">{text.units}</th></tr></thead><tbody>{data.breakdowns.map((item) => <tr key={item.key} className="border-t border-zinc-800"><td className="p-2 text-zinc-200">{item.label === "Unknown seller" ? <><p>{text.unknownSeller}</p><p className="mt-1 text-[10px] font-normal text-zinc-500">{text.unknownSellerHelp}</p></> : item.label === "Unknown" ? text.unknown : item.label === "Unassigned" ? text.unassigned : item.label}</td><td className="p-2">{money(item.revenueEur)}</td><td className="p-2">{money(item.marginEur)}</td><td className="p-2">{item.units}</td></tr>)}{!data.breakdowns.length && <tr><td colSpan={4} className="p-5 text-center text-zinc-500">{text.noData}</td></tr>}</tbody></table>
        </div>}
      </>}
      <LowStockReport locale={locale} state={state} rows={state === "ready" && data ? data.inventory : []} onRetry={refresh} />
      {loadDiscrepancies && <DiscrepancyReport role={role} locale={locale} load={loadDiscrepancies} />}
    </section>
  );
}
