"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditCategory, AuditLogItem } from "@/features/audit/model/types";
import { copy, type Locale } from "@/lib/i18n";

const categories: AuditCategory[] = ["sale", "receipt", "fx", "image", "seller", "inventory", "supplier", "catalog", "other"];
const hiddenDetailKeys = new Set(["email", "phone", "token", "access_token", "refresh_token", "password", "secret"]);

function isVisibleDetail(key: string, value: unknown): value is string | number | boolean {
  return !hiddenDetailKeys.has(key.toLowerCase()) && (typeof value === "string" || typeof value === "number" || typeof value === "boolean");
}

function formatDetail(value: string | number | boolean) {
  return typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
}

export function AuditLog({ load, locale }: { load: (page: number, category?: AuditCategory) => Promise<{ items: AuditLogItem[]; hasMore: boolean }>; locale: Locale }) {
  const text = copy[locale];
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<AuditCategory | undefined>();
  const [actor, setActor] = useState("all");
  const [entity, setEntity] = useState("all");
  const [date, setDate] = useState("");
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    void load(page, category).then((result) => {
      if (!alive) return;
      setItems(result.items);
      setHasMore(result.hasMore);
      setState("ready");
    }).catch(() => alive && setState("error"));
    return () => { alive = false; };
  }, [load, page, category]);

  const actors = useMemo(() => [...new Set(items.map((item) => item.actorName))].sort(), [items]);
  const entities = useMemo(() => [...new Set(items.map((item) => item.entityType))].sort(), [items]);
  const visibleItems = useMemo(() => items.filter((item) => {
    const itemDate = item.createdAt.slice(0, 10);
    return (actor === "all" || item.actorName === actor) && (entity === "all" || item.entityType === entity) && (!date || itemDate === date);
  }), [actor, date, entity, items]);
  const changeCategory = (next?: AuditCategory) => { setCategory(next); setPage(1); setActor("all"); setEntity("all"); setDate(""); };

  return <div className="space-y-4 p-5 sm:p-7">
    <div className="flex flex-wrap gap-2" aria-label="Audit category">
      <button type="button" onClick={() => changeCategory()} className={`rounded-lg border px-3 py-2 text-[10px] ${!category ? "border-violet-500 bg-violet-500/10 text-violet-200" : "border-zinc-800 text-zinc-500"}`}>{text.auditAll}</button>
      {categories.map((item) => <button type="button" key={item} onClick={() => changeCategory(item)} className={`rounded-lg border px-3 py-2 text-[10px] ${category === item ? "border-violet-500 bg-violet-500/10 text-violet-200" : "border-zinc-800 text-zinc-500"}`}>{text.auditCategories[item]}</button>)}
    </div>
    <div className="grid gap-2 sm:grid-cols-3">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Actor<select aria-label="Actor" value={actor} onChange={(event) => setActor(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200"><option value="all">All actors</option>{actors.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Entity<select aria-label="Entity" value={entity} onChange={(event) => setEntity(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200"><option value="all">All entities</option>{entities.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Date<input aria-label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200" /></label>
    </div>
    {state === "loading" && <p className="py-8 text-center text-xs text-zinc-500">{text.auditLoading}</p>}
    {state === "error" && <p role="alert" className="py-8 text-center text-xs text-red-300">{text.auditError}</p>}
    {state === "ready" && (visibleItems.length ? <div className="divide-y divide-zinc-800/70 rounded-xl border border-zinc-800">{visibleItems.map((item) => {
      const details = Object.entries(item.details).reduce<{ key: string; value: string | number | boolean }[]>((visible, [key, value]) => {
        if (isVisibleDetail(key, value)) visible.push({ key, value });
        return visible;
      }, []);
      return <article key={item.id} className="flex gap-3 p-3"><span className="h-fit rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-400">{text.auditCategories[item.category]}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><p className="break-all text-xs font-medium text-zinc-200">{item.action}</p><p className="font-mono text-[9px] text-zinc-600">{item.entityType}{item.entityId ? ` · ${item.entityId}` : ""}</p></div><p className="mt-1 text-[10px] text-zinc-500">{item.actorName} · {new Date(item.createdAt).toLocaleString(locale === "tr" ? "tr-TR" : "en-IE")}</p>{details.length > 0 && <dl className="mt-2 grid gap-x-4 gap-y-1 border-t border-zinc-800/70 pt-2 text-[10px] sm:grid-cols-2">{details.map(({ key, value }) => <div key={key} className="flex min-w-0 justify-between gap-2"><dt className="truncate text-zinc-600">{key.replaceAll("_", " ")}</dt><dd className="truncate text-zinc-400">{formatDetail(value)}</dd></div>)}</dl>}</div></article>;
    })}</div> : <p className="py-8 text-center text-xs text-zinc-600">{text.auditEmpty}</p>)}
    <div className="flex items-center justify-between"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="text-xs text-zinc-400 disabled:opacity-30">{text.previous}</button><span className="text-xs text-zinc-600">{page}</span><button type="button" disabled={!hasMore} onClick={() => setPage((value) => value + 1)} className="text-xs text-zinc-400 disabled:opacity-30">{text.next}</button></div>
  </div>;
}
