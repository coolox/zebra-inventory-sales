"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { calculatePaymentsTotalEur, summarizePayments, type PaymentRateMap } from "../model/payments";
import { saleCurrencies, type PaymentMethod, type SalePaymentDraft } from "../model/types";

type Props = {
  locale: Locale;
  payments: SalePaymentDraft[];
  totalEur: number | null;
  rates: PaymentRateMap;
  disabled?: boolean;
  deriveTotal?: boolean;
  awaitingTotal?: boolean;
  onChange: (payments: SalePaymentDraft[]) => void;
};

const copy = {
  en: {
    title: "Payment",
    description: "Split payment by method or currency. Totals are checked in EUR using today’s saved rates.",
    derivedDescription: "Enter each received amount. The sale total is calculated automatically in EUR.",
    method: "Method",
    amount: "Amount",
    currency: "Currency",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    add: "Add payment",
    remove: "Remove payment",
    saleTotal: "Sale total",
    paid: "Paid",
    remaining: "Remaining",
    balanced: "Payment is balanced",
    missingRate: "A daily rate is missing for one of the selected currencies.",
    invalidAmount: "Each payment amount must be greater than zero.",
    mismatch: "Payment total must match the sale total.",
    awaitingTotal: "Enter the item price to check the payment total.",
  },
  tr: {
    title: "Ödeme",
    description: "Ödemeyi yöntem veya para birimine göre bölün. Toplamlar bugünün kayıtlı kurlarıyla EUR olarak kontrol edilir.",
    derivedDescription: "Alınan her tutarı girin. Satış toplamı EUR olarak otomatik hesaplanır.",
    method: "Yöntem",
    amount: "Tutar",
    currency: "Para birimi",
    cash: "Nakit",
    card: "Kart",
    transfer: "Havale",
    add: "Ödeme ekle",
    remove: "Ödemeyi kaldır",
    saleTotal: "Satış toplamı",
    paid: "Ödenen",
    remaining: "Kalan",
    balanced: "Ödeme dengeli",
    missingRate: "Seçilen para birimlerinden biri için günlük kur eksik.",
    invalidAmount: "Her ödeme tutarı sıfırdan büyük olmalıdır.",
    mismatch: "Ödeme toplamı satış toplamıyla eşleşmelidir.",
    awaitingTotal: "Ödeme toplamını kontrol etmek için ürün fiyatını girin.",
  },
} as const;

function formatEur(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
}

function createPayment(): SalePaymentDraft {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `payment-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    method: "cash",
    amount: 0,
    currency: "EUR",
  };
}

export function PaymentEditor({ locale, payments, totalEur, rates, disabled = false, deriveTotal = false, awaitingTotal = false, onChange }: Props) {
  const text = copy[locale];
  const effectiveTotalEur = deriveTotal ? calculatePaymentsTotalEur(payments, rates) : totalEur;
  const summary = summarizePayments(payments, effectiveTotalEur, rates);
  const methods: Array<[PaymentMethod, string]> = [["cash", text.cash], ["card", text.card], ["bank_transfer", text.transfer]];
  const issue = awaitingTotal ? text.awaitingTotal
    : summary.issues.includes("amount") ? text.invalidAmount
    : summary.issues.includes("rate") ? text.missingRate
      : summary.issues.includes("total") || summary.issues.includes("empty") ? text.mismatch
        : null;

  const update = (id: string, next: Partial<SalePaymentDraft>) => {
    onChange(payments.map((payment) => payment.id === id ? { ...payment, ...next } : payment));
  };

  return <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4" aria-label={text.title}>
    <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.title}</p><p className="mt-1 text-[11px] leading-relaxed text-zinc-600">{deriveTotal ? text.derivedDescription : text.description}</p></div>
    <div className="mt-4 space-y-3">
      {payments.map((payment, index) => <div key={payment.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_96px_36px] sm:items-end">
        <label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">{text.method}</span><select disabled={disabled} value={payment.method} onChange={(event) => update(payment.id, { method: event.target.value as PaymentMethod })} className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-xs text-zinc-200 outline-none focus:border-violet-500 disabled:opacity-50">{methods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">{text.amount}</span><input disabled={disabled} aria-label={`${text.amount} ${index + 1}`} type="number" min="0.01" step="0.01" value={payment.amount || ""} onChange={(event) => update(payment.id, { amount: Number(event.target.value) })} placeholder="0.00" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-xs text-zinc-100 outline-none focus:border-violet-500 disabled:opacity-50" /></label>
        <label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">{text.currency}</span><select disabled={disabled} value={payment.currency} onChange={(event) => update(payment.id, { currency: event.target.value as SalePaymentDraft["currency"] })} className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 text-xs text-zinc-200 outline-none focus:border-violet-500 disabled:opacity-50">{saleCurrencies.map((currency) => <option key={currency}>{currency}</option>)}</select></label>
        <button type="button" disabled={disabled || payments.length === 1} onClick={() => onChange(payments.filter((item) => item.id !== payment.id))} className="flex h-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-600 hover:border-red-500/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30" aria-label={text.remove}><Trash2 size={15} /></button>
      </div>)}
    </div>
    <button type="button" disabled={disabled} onClick={() => onChange([...payments, createPayment()])} className="mt-3 flex h-9 items-center gap-2 text-xs font-medium text-violet-300 hover:text-violet-200 disabled:opacity-40"><Plus size={14} /> {text.add}</button>
    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3 text-[10px]"><div><p className="text-zinc-600">{text.saleTotal}</p><p className="mt-1 font-semibold text-zinc-200">{formatEur(summary.totalEur)}</p></div><div><p className="text-zinc-600">{text.paid}</p><p className="mt-1 font-semibold text-zinc-200">{formatEur(summary.paidEur)}</p></div><div><p className="text-zinc-600">{text.remaining}</p><p className={`mt-1 font-semibold ${summary.isValid ? "text-emerald-400" : "text-amber-400"}`}>{summary.isValid ? text.balanced : formatEur(summary.remainingEur)}</p></div></div>
    {issue && <p role="alert" className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{issue}</p>}
  </section>;
}
