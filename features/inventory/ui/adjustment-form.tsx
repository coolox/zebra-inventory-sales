"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";

export function AdjustmentForm({ locale, currentStock, onConfirm }: { locale: Locale; currentStock: number; onConfirm: (delta: number, reason: string) => Promise<void> }) {
  const tr = locale === "tr";
  const [delta, setDelta] = useState(""); const [reason, setReason] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); const value = Number(delta);
    if (!Number.isInteger(value) || value === 0) return setError(tr ? "Sıfır olmayan tam sayı girin." : "Enter a non-zero whole number.");
    if (currentStock + value < 0) return setError(tr ? "Stok sıfırın altına inemez." : "Stock cannot become negative.");
    if (!reason.trim()) return setError(tr ? "Neden zorunludur." : "A reason is required.");
    setSaving(true); setError(""); try { await onConfirm(value, reason); } catch (cause) { setError(cause instanceof Error ? cause.message : tr ? "Düzeltme kaydedilemedi." : "Adjustment could not be saved."); } finally { setSaving(false); }
  };
  return <form onSubmit={(event) => void submit(event)} className="space-y-5 p-5 sm:p-7"><div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-zinc-500">{tr ? "Mevcut stok" : "Current stock"}</p><p className="mt-2 text-2xl font-semibold text-zinc-100">{currentStock}</p></div><label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.15em] text-zinc-500">{tr ? "Miktar farkı" : "Quantity change"}</span><input aria-label={tr ? "Miktar farkı" : "Quantity change"} inputMode="numeric" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="+2 / -1" className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500" /></label><label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.15em] text-zinc-500">{tr ? "Neden" : "Reason"}</span><textarea aria-label={tr ? "Neden" : "Reason"} value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none focus:border-violet-500" /></label>{error && <p role="alert" className="text-xs text-red-300">{error}</p>}<button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-xs font-semibold text-white disabled:opacity-50">{saving ? (tr ? "Kaydediliyor…" : "Saving…") : (tr ? "Düzeltmeyi kaydet" : "Save adjustment")}</button></form>;
}
