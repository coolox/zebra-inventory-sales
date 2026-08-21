"use client";

import { ChevronLeft, ChevronRight, CreditCard, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { ExchangeFlow } from "@/features/exchanges/ui/exchange-flow";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import type { PaymentRateMap } from "../model/payments";
import {
  paginateSaleHistory,
  type SaleHistoryLine,
  type SaleHistoryRecord,
} from "../model/sale-history";
import {
  filterSaleHistory,
  readSaleHistoryFilters,
  writeSaleHistoryFilters,
  type SaleHistoryFilters,
} from "../model/sale-history-filters";
import { CancelSaleDialog } from "./cancel-sale-dialog";

const text = {
  en: {
    title: "Sales history",
    subtitle: "Store-scoped sales and reversals",
    empty: "No sales have been recorded for this filter yet.",
    status: "Confirmed",
    cancelled: "Cancelled",
    exchanged: "Exchanged",
    seller: "Seller",
    payment: "Final ticket total",
    payments: "Captured payment",
    line: "Sale line",
    lineTotal: "Line total",
    details: "Sale details",
    ticket: "Sale ticket",
    close: "Close",
    previous: "Previous",
    next: "Next",
    items: "items",
    allocated: "Allocated from total sale",
    cancel: "Cancel sale",
    exchange: "Exchange item",
    exchangeDetails: "Item exchange",
    exchangedTo: "Exchanged to",
    topUp: "Exchange top-up",
    reason: "Reason",
    all: "All",
    today: "Today",
    week: "Wed–Tue week",
    period: "Period",
    sellerFilter: "Seller",
    statusFilter: "Status",
  },
  tr: {
    title: "Satış geçmişi",
    subtitle: "Mağazaya ait satışlar ve iptaller",
    empty: "Bu filtre için satış kaydı yok.",
    status: "Onaylandı",
    cancelled: "İptal edildi",
    exchanged: "Değiştirildi",
    seller: "Satıcı",
    payment: "Son fiş toplamı",
    payments: "Alınan ödeme",
    line: "Satış satırı",
    lineTotal: "Satır toplamı",
    details: "Satış detayları",
    ticket: "Satış fişi",
    close: "Kapat",
    previous: "Önceki",
    next: "Sonraki",
    items: "adet",
    allocated: "Toplam satıştan dağıtıldı",
    cancel: "Satışı iptal et",
    exchange: "Ürünü değiştir",
    exchangeDetails: "Ürün değişimi",
    exchangedTo: "Yeni ürün",
    topUp: "Değişim ek ödemesi",
    reason: "Neden",
    all: "Tümü",
    today: "Bugün",
    week: "Çar–Sal hafta",
    period: "Dönem",
    sellerFilter: "Satıcı",
    statusFilter: "Durum",
  },
} as const;

const formatEur = (value: number) => new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
}).format(value);

type ExchangeInput = {
  replacement: Product;
  price: number;
  currency: "EUR" | "USD" | "TRY" | "RUB" | "GBP";
  reason: string;
  method: "cash" | "card" | "bank_transfer";
  topUpEur: number;
  paymentCurrency: "EUR" | "USD" | "TRY" | "RUB" | "GBP";
  paymentAmount: number;
};

type Props = {
  locale: Locale;
  records: SaleHistoryRecord[];
  sellerScope?: string;
  canCancel?: boolean;
  onCancel?: (saleId: string, reason: string) => Promise<void>;
  canExchange?: boolean;
  products?: Product[];
  paymentRates?: PaymentRateMap;
  onExchange?: (source: SaleHistoryLine, input: ExchangeInput) => Promise<void>;
};

function lineName(line: SaleHistoryLine) {
  return line.exchange?.replacementProduct ?? line.product;
}

function lineCode(line: SaleHistoryLine) {
  return line.exchange?.replacementCode ?? line.code;
}

function lineSize(line: SaleHistoryLine) {
  return line.exchange?.replacementSize ?? line.size;
}

export function SaleHistory({
  locale,
  records,
  sellerScope,
  canCancel = false,
  onCancel,
  canExchange = false,
  products = [],
  paymentRates,
  onExchange,
}: Props) {
  const copy = text[locale];
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SaleHistoryRecord | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SaleHistoryRecord | null>(null);
  const [exchangeTarget, setExchangeTarget] = useState<SaleHistoryLine | null>(null);
  const [photoTarget, setPhotoTarget] = useState<SaleHistoryLine | null>(null);
  const [filters, setFilters] = useState<SaleHistoryFilters>(() => readSaleHistoryFilters(
    typeof window === "undefined" ? "" : window.location.search,
    sellerScope,
  ));
  const filtered = useMemo(
    () => filterSaleHistory(records, { ...filters, sellerId: sellerScope ?? filters.sellerId }),
    [filters, records, sellerScope],
  );
  const result = useMemo(() => paginateSaleHistory(filtered, page), [filtered, page]);
  const sellers = [...new Map(records.map((record) => [String(record.sellerId), record.seller])).entries()];

  useEffect(() => setPage(1), [records]);
  useEffect(() => {
    if (sellerScope) setFilters((current) => ({ ...current, sellerId: sellerScope }));
  }, [sellerScope]);

  const updateFilters = (next: SaleHistoryFilters) => {
    const scoped = { ...next, sellerId: sellerScope ?? next.sellerId };
    setFilters(scoped);
    setPage(1);
    writeSaleHistoryFilters(scoped);
  };

  return <section id="sales" className="panel mt-4 scroll-mt-24 overflow-hidden rounded-2xl">
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-2">
          <ReceiptText size={17} className="text-violet-400" />
          <h2 className="text-sm font-semibold">{copy.title}</h2>
        </div>
        <p className="mt-1 text-xs text-zinc-600">{copy.subtitle}</p>
      </div>
      <span className="rounded-md border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400">
        {filtered.length} {copy.items}
      </span>
    </div>

    <div className="grid gap-2 border-b border-zinc-800/70 p-4 sm:grid-cols-3">
      {!sellerScope && <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {copy.sellerFilter}
        <select aria-label={copy.sellerFilter} value={filters.sellerId} onChange={(event) => updateFilters({ ...filters, sellerId: event.target.value })} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200">
          <option value="all">{copy.all}</option>
          {sellers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>}
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {copy.statusFilter}
        <select aria-label={copy.statusFilter} value={filters.status} onChange={(event) => updateFilters({ ...filters, status: event.target.value as SaleHistoryFilters["status"] })} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200">
          <option value="all">{copy.all}</option>
          <option value="confirmed">{copy.status}</option>
          <option value="cancelled">{copy.cancelled}</option>
        </select>
      </label>
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {copy.period}
        <select aria-label={copy.period} value={filters.period} onChange={(event) => updateFilters({ ...filters, period: event.target.value as SaleHistoryFilters["period"] })} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200">
          <option value="all">{copy.all}</option>
          <option value="today">{copy.today}</option>
          <option value="week">{copy.week}</option>
        </select>
      </label>
    </div>

    {!filtered.length
      ? <p className="px-5 py-12 text-center text-xs text-zinc-600">{copy.empty}</p>
      : <>
        <div className="divide-y divide-zinc-800/70">
          {result.items.map((sale) => {
            const hasExchange = sale.lines.some((line) => line.exchange);
            const cancelled = sale.status === "cancelled";
            const status = cancelled ? copy.cancelled : hasExchange ? copy.exchanged : copy.status;
            const productsSummary = sale.lines.map(lineName).join(" + ");
            return <button key={sale.id} type="button" onClick={() => setSelected(sale)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-900/55 sm:px-6">
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-zinc-200">{productsSummary}</span>
                <span className="mt-1 block text-[10px] text-zinc-600">{sale.seller} · {sale.time} · {sale.quantity} {copy.items}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs font-semibold text-zinc-100">{sale.ticketTotalSnapshot}</span>
                <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${cancelled ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : hasExchange ? "border-violet-500/30 bg-violet-500/10 text-violet-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"}`}>{status}</span>
              </span>
            </button>;
          })}
        </div>
        {result.pageCount > 1 && <div className="flex items-center justify-between border-t border-zinc-800/80 px-5 py-3">
          <span className="text-[10px] text-zinc-600">{result.page} / {result.pageCount}</span>
          <div className="flex gap-2">
            <button type="button" aria-label={copy.previous} disabled={result.page === 1} onClick={() => setPage((value) => value - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-35"><ChevronLeft size={15} /></button>
            <button type="button" aria-label={copy.next} disabled={result.page === result.pageCount} onClick={() => setPage((value) => value + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-35"><ChevronRight size={15} /></button>
          </div>
        </div>}
      </>}

    {selected && <Modal title={copy.details} eyebrow={`${copy.ticket} · ${selected.saleId}`} onClose={() => setSelected(null)} closeLabel={copy.close}>
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{selected.quantity} {copy.items}</h3>
            <p className="mt-1 text-xs text-zinc-500">{selected.seller} · {selected.time}</p>
          </div>
          <span className="text-base font-semibold text-zinc-100">{selected.ticketTotalSnapshot}</span>
        </div>

        <div className="mt-6 space-y-3">
          {selected.lines.map((line) => <div key={String(line.id)} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-start justify-between gap-4">
              {line.photoUrl ? <button type="button" onClick={() => setPhotoTarget(line)} aria-label={`Open photo for ${lineName(line)}`} className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-700"><img src={line.photoUrl} alt="" className="h-full w-full object-cover" /></button> : <span aria-label="No product photo" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-[9px] text-zinc-600">—</span>}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-100">{lineName(line)}</p>
                <p className="mt-1 text-[10px] text-zinc-500">{lineCode(line)} · {lineSize(line)} · {line.quantity} {copy.items}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[9px] uppercase tracking-wide text-zinc-600">{copy.lineTotal}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-200">{formatEur(line.revenueEur)}</p>
              </div>
            </div>
            {line.exchange && <dl className="mt-3 space-y-2 border-t border-zinc-800 pt-3 text-[10px]">
              <div className="flex justify-between gap-4"><dt className="text-zinc-500">{copy.exchangedTo}</dt><dd className="text-right text-zinc-200">{line.exchange.replacementProduct} · {line.exchange.replacementSize}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-zinc-500">{copy.topUp}</dt><dd className="text-right text-violet-200">€{line.exchange.topUpEur.toFixed(2)}{line.exchange.paymentSnapshot ? ` · ${line.exchange.paymentSnapshot}` : ""}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-zinc-500">{copy.reason}</dt><dd className="text-right text-zinc-200">{line.exchange.reason}</dd></div>
            </dl>}
            {line.revenueIsAllocated && <p className="mt-3 text-[10px] text-zinc-500">{copy.allocated}</p>}
            {canExchange && selected.status === "confirmed" && !line.exchange && !line.revenueIsAllocated && onExchange && paymentRates && <button type="button" onClick={() => { setExchangeTarget(line); setSelected(null); }} className="mt-3 min-h-9 rounded-lg border border-violet-500/40 px-3 text-[10px] font-semibold text-violet-200 transition hover:bg-violet-500/10">{copy.exchange}</button>}
          </div>)}
        </div>

        <dl className="mt-6 space-y-3 border-t border-zinc-800 pt-4 text-xs">
          <div className="flex justify-between gap-4"><dt className="text-zinc-500">{copy.payment}</dt><dd className="flex items-center gap-1.5 text-right text-zinc-200"><CreditCard size={13} />{selected.ticketTotalSnapshot}</dd></div>
          {selected.paymentSnapshot && selected.paymentSnapshot !== selected.ticketTotalSnapshot && <div className="flex justify-between gap-4"><dt className="text-zinc-500">{copy.payments}</dt><dd className="text-right text-zinc-200">{selected.paymentSnapshot}</dd></div>}
          <div className="flex justify-between gap-4"><dt className="text-zinc-500">{copy.status}</dt><dd className={selected.status === "cancelled" ? "text-amber-300" : selected.lines.some((line) => line.exchange) ? "text-violet-200" : "text-emerald-300"}>{selected.status === "cancelled" ? copy.cancelled : selected.lines.some((line) => line.exchange) ? copy.exchanged : copy.status}</dd></div>
        </dl>

        {canCancel && selected.status === "confirmed" && !selected.lines.some((line) => line.exchange) && onCancel && <button type="button" onClick={() => { setCancelTarget(selected); setSelected(null); }} className="mt-6 min-h-10 rounded-lg border border-red-500/40 px-4 text-xs font-semibold text-red-300 hover:bg-red-500/10">{copy.cancel}</button>}
      </div>
    </Modal>}

    {cancelTarget && onCancel && <CancelSaleDialog locale={locale} sale={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={async (saleId, reason) => {
      await onCancel(saleId, reason);
      setCancelTarget(null);
    }} />}

    {exchangeTarget && onExchange && paymentRates && <Modal title={copy.exchangeDetails} eyebrow={`${copy.line} · ${exchangeTarget.saleId}`} onClose={() => setExchangeTarget(null)} closeLabel={copy.close}>
      <ExchangeFlow locale={locale} source={exchangeTarget} products={products} rates={paymentRates} onComplete={async (input) => {
        await onExchange(exchangeTarget, input);
        setExchangeTarget(null);
      }} />
    </Modal>}
    {photoTarget?.photoUrl && <div role="dialog" aria-modal="true" aria-label={`Product photo: ${lineName(photoTarget)}`} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4" onClick={() => setPhotoTarget(null)}><button type="button" aria-label="Close photo" className="absolute right-5 top-5 rounded-lg border border-white/25 px-3 py-2 text-xs text-white">Close</button><img src={photoTarget.photoUrl} alt={lineName(photoTarget)} className="max-h-full max-w-full object-contain" onClick={(event) => event.stopPropagation()} /></div>}
  </section>;
}
