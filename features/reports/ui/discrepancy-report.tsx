"use client";

import { ChevronDown, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { ReconciliationDiscrepancy } from "../data/load-discrepancies";

const reconciliationCopy = {
  en: {
    title: "Reconciliation",
    description: "Review immutable payment, stock-movement and balance checks only when needed.",
    view: "View checks",
    hide: "Hide checks",
    refresh: "Refresh",
    loading: "Checking ledgers…",
    error: "Reconciliation could not be loaded.",
    retry: "Retry",
    empty: "No discrepancies found.",
    issue: "Issue",
    review: "Review required",
    references: "Technical references",
    detected: "Detected",
    types: {
      payment_mismatch: { label: "Payment amount differs", description: "The captured payment total differs from the immutable sale record.", expected: "Confirmed sale total", actual: "Captured payments", meaning: "Both figures are EUR amounts and should be the same.", action: "Review the sale and payment records. This check does not change either record." },
      missing_sale_movement: { label: "Sale stock movement missing", description: "A confirmed sale has no matching inventory movement.", expected: "Units sold", actual: "Recorded stock movement", meaning: "These are item quantities, not money. A confirmed sale should reduce stock by the sold quantity.", action: "Review the sale and its stock history before making any correction." },
      negative_balance: { label: "Negative stock balance", description: "The recorded inventory balance is below zero.", expected: "Lowest allowed balance", actual: "Recorded stock balance", meaning: "These are item quantities, not money. Stock should not fall below zero.", action: "Review receipts, sales and adjustments for this product before correcting stock." },
      manual_correction: { label: "Manual stock correction", description: "A manual correction needs Owner review. It is not, by itself, proof of an error.", expected: "Automatic comparison", actual: "Recorded stock adjustment", meaning: "The recorded figure is the number of items adjusted, not a sale or a payment.", action: "Review the reason and stock history. No action is required if the adjustment is correct." },
    },
  },
  tr: {
    title: "Kayıt kontrolü",
    description: "Ödeme, stok hareketi ve bakiye kayıtlarını yalnızca gerektiğinde inceleyin.",
    view: "Kontrolleri gör",
    hide: "Kontrolleri gizle",
    refresh: "Yenile",
    loading: "Kayıtlar kontrol ediliyor…",
    error: "Kayıt kontrolü yüklenemedi.",
    retry: "Tekrar dene",
    empty: "Herhangi bir fark bulunmadı.",
    issue: "Sorun",
    review: "İnceleme gerekli",
    references: "Teknik referanslar",
    detected: "Tespit zamanı",
    types: {
      payment_mismatch: { label: "Ödeme tutarı farklı", description: "Kaydedilen ödeme toplamı, değiştirilemeyen satış kaydından farklı.", expected: "Onaylı satış toplamı", actual: "Alınan ödemeler", meaning: "İki tutar da EUR cinsindedir ve aynı olmalıdır.", action: "Satış ve ödeme kayıtlarını inceleyin. Bu kontrol kayıtları değiştirmez." },
      missing_sale_movement: { label: "Satış stok hareketi eksik", description: "Onaylanmış satış için eşleşen stok hareketi yok.", expected: "Satılan adet", actual: "Kaydedilen stok hareketi", meaning: "Bunlar para değil, ürün adetleridir. Onaylı satış stoktan satılan adet kadar düşmelidir.", action: "Düzeltme yapmadan önce satışı ve stok geçmişini inceleyin." },
      negative_balance: { label: "Negatif stok bakiyesi", description: "Kaydedilen stok bakiyesi sıfırın altında.", expected: "İzin verilen en düşük bakiye", actual: "Kaydedilen stok bakiyesi", meaning: "Bunlar para değil, ürün adetleridir. Stok sıfırın altına düşmemelidir.", action: "Stok düzeltmeden önce bu ürünün kabul, satış ve düzeltmelerini inceleyin." },
      manual_correction: { label: "Manuel stok düzeltmesi", description: "Manuel düzeltme, Sahip incelemesi gerektirir. Tek başına bir hata kanıtı değildir.", expected: "Otomatik karşılaştırma", actual: "Kaydedilen stok düzeltmesi", meaning: "Kaydedilen sayı satış veya ödeme değil, elle değiştirilen ürün adedidir.", action: "Nedeni ve stok geçmişini inceleyin. Düzeltme doğruysa işlem gerekmez." },
    },
  },
} as const;

const money = (value: number | null, locale: Locale) => value === null ? "—" : new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-IE", { style: "currency", currency: "EUR" }).format(value);
const quantity = (value: number | null, locale: Locale) => value === null ? "—" : `${new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-IE", { signDisplay: "exceptZero", maximumFractionDigits: 2 }).format(value)} ${locale === "tr" ? "adet" : "items"}`;

export function DiscrepancyReport({ role, locale, load }: { role: "owner" | "seller"; locale: Locale; load: () => Promise<ReconciliationDiscrepancy[]> }) {
  const text = reconciliationCopy[locale];
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [rows, setRows] = useState<ReconciliationDiscrepancy[]>([]);

  const refresh = () => {
    setState("loading");
    void load().then((next) => { setRows(next); setState("ready"); }).catch(() => setState("error"));
  };
  const open = () => { setIsOpen(true); refresh(); };

  if (role !== "owner") return null;
  return (
    <section className="mt-6 border-t border-zinc-800 pt-5" aria-label={text.title}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><ShieldCheck size={16} aria-hidden="true" className="text-violet-300" /><h3 className="text-sm font-semibold">{text.title}</h3></div>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">{text.description}</p>
        </div>
        {isOpen ? <div className="flex shrink-0 gap-2"><button type="button" onClick={refresh} className="secondary-action flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"><RefreshCw size={14} aria-hidden="true" /> {text.refresh}</button><button type="button" onClick={() => setIsOpen(false)} className="secondary-action flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"><ChevronDown size={14} aria-hidden="true" /> {text.hide}</button></div> : <button type="button" aria-expanded="false" onClick={open} className="secondary-action flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15 sm:self-auto"><ChevronDown size={14} aria-hidden="true" /> {text.view}</button>}
      </div>
      {isOpen && <div className="mt-4" aria-live="polite">
        {state === "loading" && <p className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-6 text-center text-xs text-zinc-500">{text.loading}</p>}
        {state === "error" && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-5 text-center text-xs text-red-200">{text.error} <button type="button" onClick={refresh} className="font-semibold underline underline-offset-2">{text.retry}</button></p>}
        {state === "ready" && !rows.length && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-6 text-center text-xs text-emerald-300">{text.empty}</p>}
        {state === "ready" && rows.length > 0 && <ul className="space-y-3">{rows.map((row, index) => {
          const type = text.types[row.type];
          const isMoney = row.type === "payment_mismatch";
          const value = (amount: number | null) => isMoney ? money(amount, locale) : quantity(amount, locale);
          return <li key={`${row.type}-${index}`} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${row.severity === "error" ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>{row.severity === "error" ? text.issue : text.review}</span><p className="mt-2 text-sm font-semibold text-zinc-200">{type.label}</p><p className="mt-1 text-xs leading-relaxed text-zinc-500">{type.description}</p></div><p className="shrink-0 text-[10px] text-zinc-600">{text.detected}: {new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.occurredAt))}</p></div>
            <p className="mt-4 text-xs leading-relaxed text-zinc-400">{type.meaning}</p>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2"><div className="rounded-lg bg-zinc-900/80 p-3"><dt className="text-[10px] uppercase tracking-wide text-zinc-500">{type.expected}</dt><dd className="mt-1 break-words font-semibold text-zinc-200">{value(row.expectedValue)}</dd></div><div className="rounded-lg bg-zinc-900/80 p-3"><dt className="text-[10px] uppercase tracking-wide text-zinc-500">{type.actual}</dt><dd className="mt-1 break-words font-semibold text-zinc-200">{value(row.actualValue)}</dd></div></dl>
            <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs leading-relaxed text-zinc-400">{type.action}</p>
            <details className="mt-3 rounded-lg border border-zinc-800 px-3 py-2 text-[10px] text-zinc-500"><summary className="cursor-pointer font-semibold text-zinc-400">{text.references}</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] text-zinc-500">{JSON.stringify(row.sourceIds, null, 2)}</pre></details>
          </li>;
        })}</ul>}
      </div>}
    </section>
  );
}
