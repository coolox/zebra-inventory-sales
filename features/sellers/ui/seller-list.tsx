"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Seller } from "@/lib/types";
import type { SellerMembershipStatus } from "@/features/sellers/model/types";

const labels = {
  en: { active: "Active", blocked: "Blocked", invited: "Pending", deactivate: "Deactivate", reactivate: "Reactivate", pending: "Waiting for sign-in", empty: "No sellers yet.", updating: "Updating…" },
  tr: { active: "Aktif", blocked: "Engellendi", invited: "Bekliyor", deactivate: "Devre dışı bırak", reactivate: "Yeniden etkinleştir", pending: "Giriş bekleniyor", empty: "Henüz satıcı yok.", updating: "Güncelleniyor…" },
} as const;

function statusClass(status: SellerMembershipStatus | "invited") {
  return status === "active" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : status === "blocked" ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-amber-500/25 bg-amber-500/10 text-amber-200";
}

export function SellerList({ locale, sellers, onSetStatus }: { locale: Locale; sellers: Seller[]; onSetStatus: (seller: Seller, status: SellerMembershipStatus) => Promise<void> }) {
  const text = labels[locale];
  const [items, setItems] = useState(sellers);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => setItems(sellers), [sellers]);

  const changeStatus = async (seller: Seller, status: SellerMembershipStatus) => {
    const previous = items;
    setError("");
    setUpdatingId(seller.id);
    setItems((current) => current.map((item) => item.id === seller.id ? { ...item, membershipStatus: status } : item));
    try { await onSetStatus(seller, status); }
    catch (cause) { setItems(previous); setError(cause instanceof Error ? cause.message : "Unable to update Seller access."); }
    finally { setUpdatingId(null); }
  };

  if (!items.length) return <p className="py-8 text-center text-xs text-zinc-600">{text.empty}</p>;
  return <div className="space-y-3"><div className="divide-y divide-zinc-800/70 overflow-hidden rounded-xl border border-zinc-800">{items.map((seller) => {
    const status = seller.membershipStatus ?? "active";
    const busy = updatingId === seller.id;
    return <div key={seller.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300">{seller.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">{seller.name}</p><p className="mt-1 truncate text-[10px] text-zinc-600">{seller.email} · {seller.phone}</p></div><div className="flex items-center justify-between gap-2 sm:justify-end"><span className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${statusClass(status)}`}>{text[status]}</span>{status === "active" && <button type="button" disabled={busy} onClick={() => void changeStatus(seller, "blocked")} className="h-8 rounded-lg border border-red-500/25 px-3 text-[10px] font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50">{busy ? text.updating : text.deactivate}</button>}{status === "blocked" && <button type="button" disabled={busy} onClick={() => void changeStatus(seller, "active")} className="h-8 rounded-lg border border-emerald-500/25 px-3 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50">{busy ? text.updating : text.reactivate}</button>}{status === "invited" && <span className="text-[10px] text-zinc-600">{text.pending}</span>}</div></div>;
  })}</div>{error && <p role="alert" className="text-xs text-red-300">{error}</p>}</div>;
}
