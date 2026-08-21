import { useEffect, useRef, useState } from "react";
import { BarChart3, RefreshCw, Store, UserRound } from "lucide-react";
import { loadSellerSalesSummary, type SellerSalesSummary } from "@/features/sales/data/load-seller-sales-summary";
import type { Locale } from "@/lib/i18n";
import type { Role } from "@/lib/types";

type Copy = { title: string; subtitle: string; store: string; personal: string; today: string; week: string; month: string; year: string; allTime: string; revenue: string; units: string; loading: string; error: string; retry: string; updated: string; empty: string; unavailable: string };
const copy: Record<Locale, Copy> = {
  en: { title: "Sales summary", subtitle: "Live EUR revenue and sold units", store: "Store sales", personal: "My sales", today: "Today", week: "This week", month: "This month", year: "This year", allTime: "All time", revenue: "Revenue", units: "units", loading: "Loading sales summary…", error: "Sales summary could not be loaded.", retry: "Retry", updated: "Updated", empty: "No confirmed sales in these periods yet.", unavailable: "Your live sales summary will appear after secure sign-in." },
  tr: { title: "Satış özeti", subtitle: "Canlı EUR ciro ve satılan adet", store: "Mağaza satışları", personal: "Satışlarım", today: "Bugün", week: "Bu hafta", month: "Bu ay", year: "Bu yıl", allTime: "Tüm zamanlar", revenue: "Ciro", units: "adet", loading: "Satış özeti yükleniyor…", error: "Satış özeti yüklenemedi.", retry: "Tekrar dene", updated: "Güncellendi", empty: "Bu dönemlerde henüz onaylanmış satış yok.", unavailable: "Canlı satış özetiniz güvenli girişten sonra görünecek." },
};

const money = (value: number, locale: Locale) => new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
const integer = (value: number, locale: Locale) => new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(value);
type State = "loading" | "ready" | "error" | "unavailable";

function SummaryCard({ label, value, locale, text }: { label: string; value: { revenueEur: number; units: number }; locale: Locale; text: Copy }) {
  return <article className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p><p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-zinc-100">{money(value.revenueEur, locale)}</p><p className="mt-1 text-xs text-zinc-500">{integer(value.units, locale)} {text.units}</p></article>;
}

export function SellerSalesSummary({ role, live, storeId, locale, refreshKey = "", load = loadSellerSalesSummary }: { role: Role; live: boolean; storeId?: string | null; locale: Locale; refreshKey?: string; load?: (storeId: string) => Promise<SellerSalesSummary> }) {
  const text = copy[locale];
  const [state, setState] = useState<State>(live && storeId ? "loading" : "unavailable");
  const [summary, setSummary] = useState<SellerSalesSummary | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const requestId = useRef(0);
  const refresh = () => {
    if (!live || !storeId) { setState("unavailable"); return; }
    const currentRequest = ++requestId.current;
    setState("loading");
    void load(storeId).then((next) => {
      if (requestId.current !== currentRequest) return;
      setSummary(next);
      setUpdatedAt(new Date());
      setState("ready");
    }).catch(() => {
      if (requestId.current !== currentRequest) return;
      setSummary(null);
      setUpdatedAt(null);
      setState("error");
    });
  };

  useEffect(() => {
    if (role === "seller") refresh();
    return () => { requestId.current += 1; };
  }, [role, live, storeId, refreshKey]);
  if (role !== "seller") return null;

  return <section className="panel mt-4 rounded-2xl p-5 sm:p-6" aria-label={text.title}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">{text.title}</h2><p className="mt-1 text-xs text-zinc-500">{text.subtitle}</p>{state === "ready" && updatedAt && <p className="mt-1 text-[10px] text-zinc-600" aria-live="polite">{text.updated}: {updatedAt.toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-IE", { hour: "2-digit", minute: "2-digit" })}</p>}</div>{state === "ready" && <button type="button" onClick={refresh} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"><RefreshCw size={14} /> {text.retry}</button>}</div>{state === "loading" && <p className="py-8 text-center text-xs text-zinc-500">{text.loading}</p>}{state === "unavailable" && <p className="py-8 text-center text-xs text-zinc-500">{text.unavailable}</p>}{state === "error" && <p className="py-8 text-center text-xs text-red-300">{text.error} <button type="button" onClick={refresh} className="font-semibold underline">{text.retry}</button></p>}{state === "ready" && summary && <div className="mt-5 space-y-5"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-300"><Store size={14} className="text-violet-300" /> {text.store}</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><SummaryCard label={text.today} value={summary.store_today} locale={locale} text={text} /><SummaryCard label={text.week} value={summary.store_week} locale={locale} text={text} /></div></div><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-300"><UserRound size={14} className="text-violet-300" /> {text.personal}</div><div className="grid grid-cols-2 gap-3 lg:grid-cols-5"><SummaryCard label={text.today} value={summary.personal_today} locale={locale} text={text} /><SummaryCard label={text.week} value={summary.personal_week} locale={locale} text={text} /><SummaryCard label={text.month} value={summary.personal_month} locale={locale} text={text} /><SummaryCard label={text.year} value={summary.personal_year} locale={locale} text={text} /><SummaryCard label={text.allTime} value={summary.personal_all_time} locale={locale} text={text} /></div></div>{Object.values(summary).every((item) => item.revenueEur === 0 && item.units === 0) && <p className="flex items-center gap-2 text-xs text-zinc-500"><BarChart3 size={14} /> {text.empty}</p>}</div>}</section>;
}
