"use client";

import { AlertCircle, History, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { InventoryMovementHistoryItem } from "@/features/inventory/model/types";

const copy = {
  en: {
    loading: "Loading movement history…",
    empty: "No movements have been recorded for this variant yet.",
    error: "Movement history could not be loaded.",
    retry: "Retry",
    system: "System",
    receipt: "Receipt",
    sale: "Sale",
    adjustment: "Adjustment",
    exchange: "Exchange",
    transfer: "Transfer",
    write_off: "Write-off",
    sale_cancellation: "Sale cancellation",
    unknown: "Inventory operation",
  },
  tr: {
    loading: "Hareket geçmişi yükleniyor…",
    empty: "Bu varyant için henüz hareket kaydı yok.",
    error: "Hareket geçmişi yüklenemedi.",
    retry: "Tekrar dene",
    system: "Sistem",
    receipt: "Kabul",
    sale: "Satış",
    adjustment: "Düzeltme",
    exchange: "Değişim",
    transfer: "Transfer",
    write_off: "Fire",
    sale_cancellation: "Satış iptali",
    unknown: "Stok işlemi",
  },
} as const;

export function MovementHistory({ locale, loadHistory }: { locale: Locale; loadHistory: () => Promise<InventoryMovementHistoryItem[]> }) {
  const text = copy[locale];
  const [items, setItems] = useState<InventoryMovementHistoryItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setItems(null);
    setFailed(false);
    try {
      setItems(await loadHistory());
    } catch {
      setFailed(true);
    }
  }, [loadHistory]);

  useEffect(() => { void load(); }, [load]);

  if (items === null && !failed) return <div className="flex min-h-40 items-center justify-center gap-2 p-6 text-xs text-zinc-500"><History size={15} className="animate-pulse" />{text.loading}</div>;
  if (failed) return <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center"><AlertCircle size={20} className="text-red-300" /><p className="text-xs text-red-200">{text.error}</p><button type="button" onClick={() => void load()} className="flex h-9 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-zinc-300"><RefreshCw size={14} />{text.retry}</button></div>;
  if (!items?.length) return <div className="flex min-h-40 items-center justify-center p-6 text-center text-xs text-zinc-500">{text.empty}</div>;

  return <div className="divide-y divide-zinc-800/70">{items.map((item) => <article key={item.id} className="flex gap-3 px-5 py-4 sm:px-7"><span className={`mt-0.5 flex h-9 min-w-12 items-center justify-center rounded-lg border text-xs font-semibold ${item.quantity > 0 ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>{item.quantity > 0 ? "+" : ""}{item.quantity}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><p className="text-xs font-semibold text-zinc-200">{text[item.source]}</p><time className="text-[10px] text-zinc-600">{new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(item.occurredAt))}</time></div><p className="mt-1 text-[11px] text-zinc-500">{item.actorName || text.system}{item.reason ? ` · ${item.reason}` : ""}</p></div></article>)}</div>;
}
