"use client";

import { CalendarDays, Check, CircleAlert, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { convertForeignToEur, eurPerUnitFromQuote, quoteFromEurPerUnit } from "@/features/exchange-rates/model/rates";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

const currencies = ["EUR", "USD", "TRY", "RUB", "GBP"] as const;
type Currency = (typeof currencies)[number];
type RateProvenance = {
  provider: string;
  rate_basis: string;
  source_rate_date: string;
  fetched_at: string;
  status: "automatic" | "carried_forward" | "manual_override";
  carried_from_business_date: string | null;
};
type SyncRun = { outcome: "success" | "carried_forward" | "failed"; source_rate_date: string | null; error_message: string | null };

const labels = {
  en: {
    title: "Daily exchange rates",
    description: "Enter how many units of each currency equal 1 EUR. Example: if €1 buys $1.17, enter 1.17 for USD. Sales and receipts are converted back to EUR automatically.",
    date: "Business date",
    quote: "1 EUR equals",
    saving: "Saving…",
    save: "Save rates",
    saved: "Rates saved and recorded in the audit log.",
    error: "Rates could not be saved. Check the values and try again.",
    eur: "EUR is the base currency and always equals 1.",
    preview: "Conversion preview",
    base: "Base",
    cancel: "Cancel",
    source: "Source",
    sourceDate: "Rate date",
    updated: "Updated",
    stale: "Needs review",
    current: "Current",
    manual: "Owner manual override",
    automatic: "TCMB · Döviz Satış",
    carried: "TCMB · carried forward",
    syncFailed: "Automatic TCMB update failed. Review rates or enter an audited manual override.",
    syncCarried: "TCMB source was carried forward within the approved limit.",
  },
  tr: {
    title: "Günlük döviz kurları",
    description: "1 EUR karşılığındaki para birimi miktarını girin. Örnek: €1 ile $1,17 alınabiliyorsa USD için 1,17 girin. Satışlar ve kabuller otomatik olarak EUR'ya çevrilir.",
    date: "İşletme tarihi",
    quote: "1 EUR eşittir",
    saving: "Kaydediliyor…",
    save: "Kurları kaydet",
    saved: "Kurlar kaydedildi ve denetim kaydına eklendi.",
    error: "Kurlar kaydedilemedi. Değerleri kontrol edip tekrar deneyin.",
    eur: "EUR ana para birimidir ve her zaman 1'dir.",
    preview: "Dönüşüm önizlemesi",
    base: "Ana para",
    cancel: "İptal",
    source: "Kaynak",
    sourceDate: "Kur tarihi",
    updated: "Güncellendi",
    stale: "Kontrol gerekli",
    current: "Güncel",
    manual: "Sahip manuel düzeltmesi",
    automatic: "TCMB · Döviz Satış",
    carried: "TCMB · devredildi",
    syncFailed: "Otomatik TCMB güncellemesi başarısız oldu. Kurları kontrol edin veya denetimli manuel düzeltme girin.",
    syncCarried: "TCMB kaynağı onaylanan sınır içinde devredildi.",
  },
} as const;

function todayInIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function displayQuote(eurPerUnit: number) {
  const quote = quoteFromEurPerUnit(eurPerUnit);
  return quote ? String(Number(quote.toFixed(8))) : "";
}

export function FxRateManager({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const text = labels[locale];
  const [businessDate, setBusinessDate] = useState(todayInIstanbul);
  const [quotes, setQuotes] = useState<Record<Currency, string>>({ EUR: "1", USD: "", TRY: "", RUB: "", GBP: "" });
  const [provenance, setProvenance] = useState<Partial<Record<Currency, RateProvenance>>>({});
  const [syncRun, setSyncRun] = useState<SyncRun | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const loadRates = async () => {
      const { data } = await createClient().from("exchange_rates").select("currency, eur_rate, provider, rate_basis, source_rate_date, fetched_at, status, carried_from_business_date").eq("business_date", businessDate);
      if (!data) return;
      setQuotes((current) => ({
        ...current,
        ...Object.fromEntries(data.map((row) => [row.currency as Currency, row.currency === "EUR" ? "1" : displayQuote(Number(row.eur_rate))])),
        EUR: "1",
      }));
      setProvenance(Object.fromEntries(data.map((row) => [row.currency as Currency, {
        provider: row.provider,
        rate_basis: row.rate_basis,
        source_rate_date: row.source_rate_date,
        fetched_at: row.fetched_at,
        status: row.status,
        carried_from_business_date: row.carried_from_business_date,
      }])));
      const { data: syncRuns } = await createClient().from("exchange_rate_sync_runs").select("outcome, source_rate_date, error_message").eq("business_date", businessDate);
      setSyncRun((syncRuns?.[0] as SyncRun | undefined) ?? null);
    };
    void loadRates();
  }, [businessDate]);

  const save = async () => {
    setState("saving");
    const client = createClient();
    const entries = currencies.filter((currency) => currency === "EUR" || quotes[currency].trim()).map((currency) => ({
      p_business_date: businessDate,
      p_currency: currency,
      p_eur_rate: currency === "EUR" ? 1 : eurPerUnitFromQuote(Number(quotes[currency])),
    }));
    if (entries.some((entry) => !Number.isFinite(entry.p_eur_rate) || entry.p_eur_rate <= 0)) {
      setState("error");
      return;
    }
    const results = await Promise.all(entries.map((params) => client.rpc("upsert_exchange_rate", params)));
    if (results.some((result) => result.error)) {
      setState("error");
      return;
    }
    setProvenance((current) => ({
      ...current,
      ...Object.fromEntries(entries.map((entry) => [entry.p_currency as Currency, {
        provider: "manual",
        rate_basis: "owner_manual",
        source_rate_date: businessDate,
        fetched_at: new Date().toISOString(),
        status: "manual_override" as const,
        carried_from_business_date: null,
      }])),
    }));
    setState("saved");
  };

  return <div className="p-5 sm:p-7">
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4"><p className="text-sm font-semibold text-zinc-100">{text.title}</p><p className="mt-1 text-xs leading-relaxed text-zinc-500">{text.description}</p></div>
    {syncRun?.outcome === "failed" && <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">{text.syncFailed}</p>}
    {syncRun?.outcome === "carried_forward" && <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">{text.syncCarried}</p>}
    <label className="mt-6 block"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.date}</span><div className="relative mt-2"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" /><input type="date" value={businessDate} onChange={(event) => { setBusinessDate(event.target.value); setState("idle"); }} className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-xs text-zinc-100 outline-none focus:border-violet-500" /></div></label>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{currencies.map((currency) => { const quote = Number(quotes[currency]); const preview = currency === "EUR" ? 100 : convertForeignToEur(100, quote); const source = provenance[currency]; const stale = Boolean(source && source.source_rate_date < businessDate); const sourceLabel = source?.status === "manual_override" ? text.manual : source?.status === "carried_forward" ? text.carried : text.automatic; return <label key={currency} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-200">{currency}</span>{currency === "EUR" && <span className="text-[10px] text-zinc-600">{text.base}</span>}</div><span className="mt-3 block text-[9px] font-semibold uppercase tracking-[0.13em] text-zinc-600">{text.quote}</span><div className="mt-1 flex items-center gap-2"><input disabled={currency === "EUR"} type="number" min="0.00000001" step="0.00000001" value={quotes[currency]} onChange={(event) => { setQuotes((current) => ({ ...current, [currency]: event.target.value })); setState("idle"); }} placeholder="0.00000000" className="h-9 min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-violet-500 disabled:cursor-not-allowed disabled:text-zinc-500" /><span className="text-[10px] font-semibold text-zinc-500">{currency}</span></div>{quote > 0 && <p className="mt-2 text-[10px] text-zinc-600">{text.preview}: 100 {currency} = €{preview.toFixed(2)}</p>}{source && <div className="mt-3 border-t border-zinc-800 pt-2 text-[10px] leading-relaxed text-zinc-600"><p><span className="text-zinc-500">{text.source}:</span> {sourceLabel}</p><p><span className="text-zinc-500">{text.sourceDate}:</span> {source.source_rate_date} · <span className={stale ? "text-amber-400" : "text-emerald-400"}>{stale ? text.stale : text.current}</span></p></div>}</label>; })}</div>
    <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">{text.eur}</p>
    {state === "saved" && <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300"><Check size={15} />{text.saved}</p>}
    {state === "error" && <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200"><CircleAlert size={15} />{text.error}</p>}
    <div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1.4fr]"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-zinc-200">{text.cancel}</button><button type="button" disabled={state === "saving"} onClick={save} className="purple-shadow flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50"><Save size={15} />{state === "saving" ? text.saving : text.save}</button></div>
  </div>;
}
