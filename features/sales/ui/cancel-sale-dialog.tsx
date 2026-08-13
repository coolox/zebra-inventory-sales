"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Modal } from "@/components/modal";
import type { SaleHistoryRecord } from "../model/sale-history";

const text = {
  en: { title: "Cancel sale", eyebrow: "Irreversible inventory reversal", body: "This restores stock and records a reversal for the whole sale.", reason: "Cancellation reason", placeholder: "For example: customer returned the item", required: "Enter a cancellation reason.", back: "Keep sale", submit: "Cancel sale", loading: "Cancelling…" },
  tr: { title: "Satışı iptal et", eyebrow: "Geri alınamaz stok iadesi", body: "Bu işlem stokları geri yükler ve tüm satış için ters kayıt oluşturur.", reason: "İptal nedeni", placeholder: "Örneğin: müşteri ürünü iade etti", required: "İptal nedeni girin.", back: "Satışı koru", submit: "Satışı iptal et", loading: "İptal ediliyor…" },
} as const;

export function CancelSaleDialog({ locale, sale, onClose, onConfirm }: { locale: Locale; sale: SaleHistoryRecord; onClose: () => void; onConfirm: (saleId: string, reason: string) => Promise<void> }) {
  const copy = text[locale];
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = reason.trim();
    if (!value) { setError(copy.required); return; }
    setLoading(true); setError("");
    try { await onConfirm(sale.saleId, value); }
    catch (cause) { setError(cause instanceof Error ? cause.message : ""); setLoading(false); }
  };

  return <Modal title={copy.title} eyebrow={copy.eyebrow} onClose={loading ? () => undefined : onClose} closeLabel={copy.back}>
    <form className="space-y-5 p-5 sm:p-7" onSubmit={submit}>
      <p className="text-sm leading-6 text-zinc-400">{copy.body}</p>
      <label className="block text-xs font-medium text-zinc-200">{copy.reason}
        <textarea autoFocus value={reason} onChange={(event) => { setReason(event.target.value); setError(""); }} placeholder={copy.placeholder} disabled={loading} rows={3} aria-invalid={Boolean(error)} aria-describedby={error ? "cancel-sale-error" : undefined} className="mt-2 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-400 disabled:opacity-60" />
      </label>
      {error && <p id="cancel-sale-error" role="alert" className="text-xs text-red-300">{error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={loading} className="min-h-10 rounded-lg border border-zinc-700 px-4 text-xs font-semibold text-zinc-300 disabled:opacity-50">{copy.back}</button><button type="submit" disabled={loading} className="min-h-10 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-400 disabled:opacity-60">{loading ? copy.loading : copy.submit}</button></div>
    </form>
  </Modal>;
}
