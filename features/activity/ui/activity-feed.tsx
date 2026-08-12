import { Activity as ActivityIcon, Boxes, CircleDollarSign, PackagePlus } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Activity } from "@/lib/types";
import { formatActivityAmount } from "../model/format-activity";

export function ActivityFeed({ items, locale, compact = false, onViewAll, formatMoney }: { items: Activity[]; locale: Locale; compact?: boolean; onViewAll?: () => void; formatMoney: (amount: number, currency?: string) => string }) {
  const visible = compact ? items.slice(0, 5) : items;
  const label = locale === "tr" ? "İşlemler" : "Activity";
  const empty = locale === "tr" ? "Henüz işlem yok." : "No operations yet.";
  return <article className={compact ? "panel rounded-2xl p-5 sm:p-6" : ""}>
    {compact && <div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-zinc-600">{locale === "tr" ? "Son işlemler" : "Recent operations"}</p></div><ActivityIcon size={17} className="text-zinc-700" /></div>}
    <div className={compact ? "mt-5 space-y-1" : "divide-y divide-zinc-800/70 p-5 sm:p-7"}>{visible.length ? visible.map((item, index) => {
      const Icon = item.type === "sale" ? CircleDollarSign : item.type === "receipt" ? PackagePlus : Boxes;
      return <div key={item.id} className={`relative flex gap-3 ${compact ? "pb-5 last:pb-0" : "py-4 first:pt-0 last:pb-0"}`}>
        {compact && index < visible.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-28px)] w-px bg-zinc-800" />}
        <span className={`relative z-10 flex h-${compact ? "8" : "9"} w-${compact ? "8" : "9"} shrink-0 items-center justify-center rounded-lg border ${item.type === "sale" ? "border-violet-500/20 bg-violet-500/10 text-violet-400" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}><Icon size={compact ? 14 : 15} /></span>
        <div className="min-w-0 flex-1 pt-0.5"><div className="flex justify-between gap-3"><p className={`truncate font-medium text-zinc-300 ${compact ? "text-[11px]" : "text-xs"}`}>{item.title}</p>{formatActivityAmount(item, formatMoney) && <span className={`shrink-0 font-semibold text-zinc-200 ${compact ? "text-[11px]" : "text-xs"}`}>{formatActivityAmount(item, formatMoney)}</span>}</div><p className={`mt-1 truncate text-zinc-600 ${compact ? "text-[10px]" : "text-[11px]"}`}>{item.meta}</p></div>
      </div>;
    }) : <p className="py-10 text-center text-xs text-zinc-600">{empty}</p>}</div>
    {compact && onViewAll && <button type="button" onClick={onViewAll} className="mt-5 w-full rounded-lg border border-zinc-800 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300">{locale === "tr" ? "Tüm işlemler" : "All activity"}</button>}
  </article>;
}
