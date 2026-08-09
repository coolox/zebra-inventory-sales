"use client";

import { CalendarDays, Check, CircleAlert, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

const currencies = ["EUR", "USD", "TRY", "RUB", "GBP"] as const;
type Currency = (typeof currencies)[number];

const labels = {
  en: {
    title: "Daily exchange rates",
    description: "How many EUR equal one unit of each currency. Rates are fixed on receipts created today.",
    date: "Business date",
    rate: "EUR rate",
    saving: "Saving…",
    save: "Save rates",
    saved: "Rates saved and recorded in the audit log.",
    error: "Rates could not be saved. Check the values and try again.",
    eur: "EUR is the base currency and always equals 1.",
  },
  tr: {
    title: "Günlük döviz kurları",
    description: "Her para biriminin bir biriminin EUR karşılığı. Bugün oluşturulan kabullerde bu kurlar sabitlenir.",
    date: "İşletme tarihi",
    rate: "EUR kuru",
    saving: "Kaydediliyor…",
    save: "Kurları kaydet",
    saved: "Kurlar kaydedildi ve denetim kaydına eklendi.",
    error: "Kurlar kaydedilemedi. Değerleri kontrol edip tekrar deneyin.",
    eur: "EUR ana para birimidir ve her zaman 1'dir.",
  },
} as const;

function todayInIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function FxRateManager({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const text = labels[locale];
  const [businessDate, setBusinessDate] = useState(todayInIstanbul);
  const [rates, setRates] = useState<Record<Currency, string>>({ EUR: "1", USD: "", TRY: "", RUB: "", GBP: "" });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const loadRates = async () => {
      const { data } = await createClient().from("exchange_rates").select("currency, eur_rate").eq("business_date", businessDate);
      if (!data) return;
      setRates((current) => ({
        ...current,
        ...Object.fromEntries(data.map((row) => [row.currency as Currency, String(row.eur_rate)])),
        EUR: "1",
      }));
    };
    void loadRates();
  }, [businessDate]);

  const save = async () => {
    setState("saving");
    const client = createClient();
    const entries = currencies.filter((currency) => currency === "EUR" || rates[currency].trim()).map((currency) => ({
      p_business_date: businessDate,
      p_currency: currency,
      p_eur_rate: Number(currency === "EUR" ? 1 : rates[currency]),
    }));
    const results = await Promise.all(entries.map((params) => client.rpc("upsert_exchange_rate", params)));
    if (results.some((result) => result.error)) {
      setState("error");
      return;
    }
    setState("saved");
  };

  return <div className="p-5 sm:p-7">
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4"><p className="text-sm font-semibold text-zinc-100">{text.title}</p><p className="mt-1 text-xs leading-relaxed text-zinc-500">{text.description}</p></div>
    <label className="mt-6 block"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.date}</span><div className="relative mt-2"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" /><input type="date" value={businessDate} onChange={(event) => { setBusinessDate(event.target.value); setState("idle"); }} className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-xs text-zinc-100 outline-none focus:border-violet-500" /></div></label>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{currencies.map((currency) => <label key={currency} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-200">{currency}</span>{currency === "EUR" && <span className="text-[10px] text-zinc-600">Base</span>}</div><span className="mt-3 block text-[9px] font-semibold uppercase tracking-[0.13em] text-zinc-600">{text.rate}</span><input disabled={currency === "EUR"} type="number" min="0.00000001" step="0.00000001" value={rates[currency]} onChange={(event) => { setRates((current) => ({ ...current, [currency]: event.target.value })); setState("idle"); }} placeholder="0.00000000" className="mt-1 h-9 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-violet-500 disabled:cursor-not-allowed disabled:text-zinc-500" /></label>)}</div>
    <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">{text.eur}</p>
    {state === "saved" && <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300"><Check size={15} />{text.saved}</p>}
    {state === "error" && <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200"><CircleAlert size={15} />{text.error}</p>}
    <div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1.4fr]"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-zinc-200">Cancel</button><button type="button" disabled={state === "saving"} onClick={save} className="purple-shadow flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50"><Save size={15} />{state === "saving" ? text.saving : text.save}</button></div>
  </div>;
}
