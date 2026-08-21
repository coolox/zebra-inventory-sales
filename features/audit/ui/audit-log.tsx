"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditCategory, AuditLogItem } from "@/features/audit/model/types";
import { copy, type Locale } from "@/lib/i18n";
import { businessDate } from "@/lib/business-date";

const categories: AuditCategory[] = ["sale", "receipt", "fx", "image", "seller", "inventory", "supplier", "catalog", "other"];
const hiddenDetailKeys = new Set(["email", "phone", "token", "access_token", "refresh_token", "password", "secret"]);

function isVisibleDetail(key: string, value: unknown): value is string | number | boolean {
  return !hiddenDetailKeys.has(key.toLowerCase()) && (typeof value === "string" || typeof value === "number" || typeof value === "boolean");
}

const auditUi: Record<Locale, { actor: string; entity: string; date: string; allActors: string; allEntities: string; technical: string; otherAction: string; otherEntity: string; actions: Record<string, string>; entities: Record<string, string>; detailKeys: Record<string, string>; detailValues: Record<string, string> }> = {
  en: { actor: "Actor", entity: "Record", date: "Date", allActors: "All actors", allEntities: "All records", technical: "Technical reference", otherAction: "Other recorded action", otherEntity: "Other record", actions: { "sale.confirmed": "Sale confirmed", "sale.cancelled": "Sale cancelled", "sale.exchanged": "Product exchanged", "sale.adjusted": "Sale adjusted", "sale.filtered": "Sale filtered", "sale.stale": "Sale updated", "receipt.confirmed": "Receipt confirmed", "inventory.receipt_confirmed": "Products received", "inventory.adjusted": "Stock adjusted", "inventory.count_confirmed": "Stock count confirmed", "inventory.low_stock_threshold_set": "Low-stock threshold updated", "supplier.saved": "Supplier saved", "supplier.archived": "Supplier archived", "supplier.restored": "Supplier restored", "seller.invited": "Seller invited", "seller.deactivated": "Seller deactivated", "seller.reactivated": "Seller reactivated", "exchange_rate.upserted": "Exchange rate updated", "product_model.archived": "Product archived", "product_model.restored": "Product restored", "product_model.code_updated": "Product code updated", "catalog.color_normalized": "Product colour standardised" }, entities: { sale: "Sale", receipt: "Receipt", sale_exchange: "Product exchange", inventory_count: "Stock count", inventory_movement: "Stock movement", purchase_receipt: "Product receipt", product_model: "Product", product_variant: "Product variant", supplier: "Supplier", seller_invitation: "Seller invitation", store_membership: "Seller access", exchange_rate: "Exchange rate", store_inventory_policy: "Store stock policy" }, detailKeys: { source: "Source", pricing_mode: "Pricing method", quantity_delta: "Stock change", stock_before: "Stock before", stock_after: "Stock after", threshold: "Low-stock threshold", model_code: "Product code", variant_count: "Variants received", line_count: "Lines", changed_variants: "Variants changed", top_up_eur: "Additional payment (EUR)", quantity: "Quantity", reason: "Reason", currency: "Currency", eur_rate: "EUR rate", old_model_code: "Previous product code", new_model_code: "New product code", old_color: "Previous colour", new_color: "New colour", is_active: "Active" }, detailValues: { web: "Web app", manual: "Manual entry", per_item: "Price per item", sale_total: "Sale total" } },
  tr: { actor: "İşlemi yapan", entity: "Kayıt", date: "Tarih", allActors: "Tüm işlemi yapanlar", allEntities: "Tüm kayıt türleri", technical: "Teknik referans", otherAction: "Diğer kaydedilmiş işlem", otherEntity: "Diğer kayıt", actions: { "sale.confirmed": "Satış onaylandı", "sale.cancelled": "Satış iptal edildi", "sale.exchanged": "Ürün değiştirildi", "inventory.receipt_confirmed": "Ürün kabulü onaylandı", "inventory.adjusted": "Stok düzeltildi", "inventory.count_confirmed": "Stok sayımı onaylandı", "inventory.low_stock_threshold_set": "Düşük stok eşiği güncellendi", "supplier.saved": "Tedarikçi kaydedildi", "supplier.archived": "Tedarikçi arşivlendi", "supplier.restored": "Tedarikçi geri yüklendi", "seller.invited": "Satıcı davet edildi", "seller.deactivated": "Satıcı devre dışı bırakıldı", "seller.reactivated": "Satıcı yeniden etkinleştirildi", "exchange_rate.upserted": "Döviz kuru güncellendi", "product_model.archived": "Ürün arşivlendi", "product_model.restored": "Ürün geri yüklendi", "product_model.code_updated": "Ürün kodu güncellendi", "catalog.color_normalized": "Ürün rengi standartlaştırıldı" }, entities: { sale: "Satış", sale_exchange: "Ürün değişimi", inventory_count: "Stok sayımı", inventory_movement: "Stok hareketi", purchase_receipt: "Ürün kabulü", product_model: "Ürün", product_variant: "Ürün varyantı", supplier: "Tedarikçi", seller_invitation: "Satıcı daveti", store_membership: "Satıcı erişimi", exchange_rate: "Döviz kuru", store_inventory_policy: "Mağaza stok politikası" }, detailKeys: { source: "Kaynak", pricing_mode: "Fiyatlandırma yöntemi", quantity_delta: "Stok değişimi", stock_before: "Önceki stok", stock_after: "Sonraki stok", threshold: "Düşük stok eşiği", model_code: "Ürün kodu", variant_count: "Kabul edilen varyant", line_count: "Satır", changed_variants: "Değişen varyant", top_up_eur: "Ek ödeme (EUR)", quantity: "Adet", reason: "Neden", currency: "Para birimi", eur_rate: "EUR kuru", old_model_code: "Önceki ürün kodu", new_model_code: "Yeni ürün kodu", old_color: "Önceki renk", new_color: "Yeni renk", is_active: "Etkin" }, detailValues: { web: "Web uygulaması", manual: "Manuel giriş", per_item: "Ürün başına fiyat", sale_total: "Toplam satış fiyatı" } },
};

function formatDetail(key: string, value: string | number | boolean, locale: Locale) {
  const labels = auditUi[locale];
  if (typeof value === "boolean") return value ? (locale === "tr" ? "Evet" : "Yes") : (locale === "tr" ? "Hayır" : "No");
  return typeof value === "string" ? labels.detailValues[value] ?? value : String(value);
}

export function AuditLog({ load, locale }: { load: (page: number, category?: AuditCategory) => Promise<{ items: AuditLogItem[]; hasMore: boolean }>; locale: Locale }) {
  const text = copy[locale];
  const labels = auditUi[locale];
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
    const itemDate = businessDate(new Date(item.createdAt));
    return (actor === "all" || item.actorName === actor) && (entity === "all" || item.entityType === entity) && (!date || itemDate === date);
  }), [actor, date, entity, items]);
  const changeCategory = (next?: AuditCategory) => { setCategory(next); setPage(1); setActor("all"); setEntity("all"); setDate(""); };
  const resetPage = () => setPage(1);
  const canGoPrevious = state === "ready" && page > 1;
  // actor/entity/date refine the already authorised page. An empty refinement
  // must not offer a supposedly valid continuation from the unfiltered query.
  const canGoNext = state === "ready" && visibleItems.length > 0 && hasMore;

  return <div className="space-y-4 p-5 sm:p-7">
    <div className="flex flex-wrap gap-2" aria-label="Audit category">
      <button type="button" onClick={() => changeCategory()} className={`audit-category-chip rounded-lg border px-3 py-2 text-[10px] ${!category ? "is-selected border-violet-500 bg-violet-500/10 text-violet-200" : "border-zinc-800 text-zinc-500"}`}>{text.auditAll}</button>
      {categories.map((item) => <button type="button" key={item} onClick={() => changeCategory(item)} className={`audit-category-chip rounded-lg border px-3 py-2 text-[10px] ${category === item ? "is-selected border-violet-500 bg-violet-500/10 text-violet-200" : "border-zinc-800 text-zinc-500"}`}>{text.auditCategories[item]}</button>)}
    </div>
    <div className="grid gap-2 sm:grid-cols-3">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{labels.actor}<select aria-label={labels.actor} value={actor} onChange={(event) => { setActor(event.target.value); resetPage(); }} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200"><option value="all">{labels.allActors}</option>{actors.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{labels.entity}<select aria-label={labels.entity} value={entity} onChange={(event) => { setEntity(event.target.value); resetPage(); }} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200"><option value="all">{labels.allEntities}</option>{entities.map((name) => <option key={name} value={name}>{labels.entities[name] ?? labels.otherEntity}</option>)}</select></label>
      <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{labels.date}<input aria-label={labels.date} type="date" value={date} onChange={(event) => { setDate(event.target.value); resetPage(); }} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200" /></label>
    </div>
    {state === "loading" && <p className="py-8 text-center text-xs text-zinc-500">{text.auditLoading}</p>}
    {state === "error" && <p role="alert" className="py-8 text-center text-xs text-red-300">{text.auditError}</p>}
    {state === "ready" && (visibleItems.length ? <div className="divide-y divide-zinc-800/70 rounded-xl border border-zinc-800">{visibleItems.map((item) => {
      const details = Object.entries(item.details).reduce<{ key: string; value: string | number | boolean }[]>((visible, [key, value]) => {
        if (isVisibleDetail(key, value)) visible.push({ key, value });
        return visible;
      }, []);
      return <article key={item.id} className="flex gap-3 p-3"><span className="h-fit rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-400">{text.auditCategories[item.category]}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><p className="text-xs font-medium text-zinc-200">{labels.actions[item.action] ?? labels.otherAction}</p><p className="text-[10px] text-zinc-500">{labels.entities[item.entityType] ?? labels.otherEntity}</p></div><p className="mt-1 text-[10px] text-zinc-500">{item.actorName} · {new Date(item.createdAt).toLocaleString(locale === "tr" ? "tr-TR" : "en-IE")}</p>{details.length > 0 && <dl className="mt-2 grid gap-x-4 gap-y-1 border-t border-zinc-800/70 pt-2 text-[10px] sm:grid-cols-2">{details.map(({ key, value }) => <div key={key} className="flex min-w-0 justify-between gap-2"><dt className="truncate text-zinc-600">{labels.detailKeys[key] ?? labels.otherEntity}</dt><dd className="truncate text-zinc-400">{formatDetail(key, value, locale)}</dd></div>)}</dl>}<details className="mt-2 text-[10px] text-zinc-600"><summary className="cursor-pointer font-semibold text-zinc-500">{labels.technical}</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-zinc-800 bg-zinc-950/50 p-2 font-mono text-[10px] text-zinc-600">{JSON.stringify({ action: item.action, entity_type: item.entityType, entity_id: item.entityId, details: Object.fromEntries(details.map(({ key, value }) => [key, value])) }, null, 2)}</pre></details></div></article>;
    })}</div> : <p className="py-8 text-center text-xs text-zinc-600">{text.auditEmpty}</p>)}
    <div className="flex items-center justify-between" aria-label={locale === "tr" ? "Sayfalandırma" : "Pagination"}><button type="button" disabled={!canGoPrevious} onClick={() => canGoPrevious && setPage((value) => value - 1)} className="text-xs text-zinc-400 disabled:cursor-not-allowed disabled:opacity-30">{text.previous}</button><span aria-live="polite" className="text-xs text-zinc-600">{page}</span><button type="button" disabled={!canGoNext} onClick={() => canGoNext && setPage((value) => value + 1)} className="text-xs text-zinc-400 disabled:cursor-not-allowed disabled:opacity-30">{text.next}</button></div>
  </div>;
}
