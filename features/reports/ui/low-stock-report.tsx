"use client";

import { ChevronDown, PackageSearch, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { InventoryReportRow } from "../data/load-inventory-report";

const lowStockCopy = {
  en: {
    title: "Low stock", description: "Variants at or below their reorder threshold.", view: "View list", hide: "Hide list", loading: "Loading low-stock products…", error: "Low-stock products could not be loaded.", retry: "Retry", empty: "All clear", emptyDescription: "No variants are at or below their reorder threshold.", oneNeedsAttention: "1 variant needs attention", manyNeedAttention: (count: number) => String(count) + " variants need attention", onHand: "On hand", threshold: "Threshold", sellThrough: "Sell-through",
  },
  tr: {
    title: "Düşük stok", description: "Yeniden sipariş eşiğinde veya altında olan varyantlar.", view: "Listeyi gör", hide: "Listeyi gizle", loading: "Düşük stoklu ürünler yükleniyor…", error: "Düşük stoklu ürünler yüklenemedi.", retry: "Tekrar dene", empty: "Her şey yolunda", emptyDescription: "Yeniden sipariş eşiğinde veya altında varyant yok.", oneNeedsAttention: "1 varyant dikkat gerektiriyor", manyNeedAttention: (count: number) => String(count) + " varyant dikkat gerektiriyor", onHand: "Mevcut stok", threshold: "Eşik", sellThrough: "Satış oranı",
  },
} as const;

type Props = { locale: Locale; state: "loading" | "ready" | "error"; rows: InventoryReportRow[]; onRetry: () => void };

export function LowStockReport({ locale, state, rows, onRetry }: Props) {
  const text = lowStockCopy[locale];
  const [isOpen, setIsOpen] = useState(false);
  const items = useMemo(() => rows.filter((row) => row.isLowStock).sort((a, b) => a.balance - b.balance || a.modelCode.localeCompare(b.modelCode)), [rows]);
  const summary = items.length === 1 ? text.oneNeedsAttention : text.manyNeedAttention(items.length);
  const iconClass = state === "error" ? "text-red-300" : items.length ? "text-amber-300" : "text-emerald-300";
  const summaryClass = items.length ? "text-amber-300" : "text-emerald-300";

  return (
    <section className="mt-5 border-t border-zinc-800 pt-5" aria-label={text.title}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><PackageSearch size={16} aria-hidden="true" className={iconClass} /><h3 className="text-sm font-semibold">{text.title}</h3></div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{text.description}</p>
          {state === "ready" && <p className={"mt-2 text-xs font-semibold " + summaryClass}>{items.length ? summary : text.empty}</p>}
          {state === "loading" && <p className="mt-2 text-xs text-zinc-500">{text.loading}</p>}
          {state === "error" && <p role="alert" className="mt-2 text-xs text-red-300">{text.error}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          {state === "error" && <button type="button" onClick={onRetry} className="flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 px-3 text-xs font-semibold text-red-200 transition hover:border-red-400/50"><RefreshCw size={14} aria-hidden="true" /> {text.retry}</button>}
          {isOpen ? <button type="button" onClick={() => setIsOpen(false)} className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"><ChevronDown size={14} aria-hidden="true" /> {text.hide}</button> : <button type="button" disabled={state !== "ready"} aria-expanded="false" onClick={() => setIsOpen(true)} className="flex h-9 items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-45"><ChevronDown size={14} aria-hidden="true" /> {text.view}</button>}
        </div>
      </div>
      {isOpen && state === "ready" && <div className="mt-4" aria-live="polite">
        {!items.length ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-6 text-center"><p className="text-sm font-semibold text-emerald-300">{text.empty}</p><p className="mt-1 text-xs text-zinc-500">{text.emptyDescription}</p></div> : <ul className="space-y-3">{items.map((row) => <li key={row.variantId} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-200">{row.modelCode} · {row.color}/{row.size}</p><p className="mt-1 truncate text-xs text-zinc-500">{row.modelName}</p></div><span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300">{row.balance} / {row.lowStockThreshold}</span></div><dl className="mt-4 grid grid-cols-3 gap-2 text-xs"><div className="rounded-lg bg-zinc-900/80 p-3"><dt className="text-[10px] uppercase tracking-wide text-zinc-600">{text.onHand}</dt><dd className="mt-1 font-semibold text-zinc-200">{row.balance}</dd></div><div className="rounded-lg bg-zinc-900/80 p-3"><dt className="text-[10px] uppercase tracking-wide text-zinc-600">{text.threshold}</dt><dd className="mt-1 font-semibold text-zinc-200">{row.lowStockThreshold}</dd></div><div className="rounded-lg bg-zinc-900/80 p-3"><dt className="text-[10px] uppercase tracking-wide text-zinc-600">{text.sellThrough}</dt><dd className="mt-1 font-semibold text-zinc-200">{Math.round(row.sellThrough * 100)}%</dd></div></dl></li>)}</ul>}
      </div>}
    </section>
  );
}
