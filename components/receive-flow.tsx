"use client";

import { Check, PackagePlus, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export type ReceiptDraft = Omit<Product, "id" | "updated">;
type Currency = Product["currency"];
type Gender = Product["gender"];
type Props = { locale: Locale; products: Product[]; onCancel: () => void; onSave: (lines: ReceiptDraft[]) => void | Promise<void> };

const currencies: Currency[] = ["EUR", "USD", "TRY", "RUB", "GBP"];
const genders: Gender[] = ["women", "men", "unisex"];
const standardSizes = ["XS", "S", "M", "L", "XL", "2XL", "0", "1", "2", "3"];

function unique(values: string[]) { return [...new Set(values.map((value) => value.trim()).filter(Boolean))]; }

function Chips({ values, selected, onSelect }: { values: string[]; selected?: string; onSelect: (value: string) => void }) {
  if (!values.length) return null;
  return <div className="mt-2 flex flex-wrap gap-1.5">{values.slice(0, 10).map((value) => <button key={value} type="button" onClick={() => onSelect(value)} className={`rounded-md border px-2.5 py-1.5 text-[10px] transition ${selected === value ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-violet-500/40 hover:text-zinc-200"}`}>{value}</button>)}</div>;
}

const emptyForm = { code: "", name: "", brand: "", category: "", gender: "women" as Gender, color: "", cost: "", currency: "EUR" as Currency, supplier: "" };

function receiptErrorMessage(error: unknown, locale: Locale) {
  const message = error instanceof Error ? error.message : "";
  const translate = locale === "tr";

  if (/exchange rate/i.test(message)) {
    return translate
      ? "Bu para birimi için bugünün döviz kuru bulunamadı. Sahip ayarlarından kuru kaydedip tekrar deneyin."
      : "Today’s exchange rate for this currency is missing. Save it in Owner settings, then try again.";
  }
  if (/No access to this store|Only an Owner/i.test(message)) {
    return translate
      ? "Bu işlem için mağaza erişiminiz yok. Sahip hesabıyla tekrar giriş yapın."
      : "You do not have permission for this store. Sign in with the Owner account and try again.";
  }
  if (/New model requires|Model code is required|Each receipt line requires|Invalid receipt line|Receipt quantity/i.test(message)) {
    return translate
      ? "Bazı ürün bilgileri eksik veya geçersiz. Model, renk, beden, miktar ve maliyeti kontrol edin."
      : "Some product details are missing or invalid. Check the model, color, size, quantity and cost.";
  }
  return translate
    ? "Kabul kaydedilemedi. Lütfen tekrar deneyin. Sorun sürerse sahibine bildirin."
    : "The receipt could not be saved. Try again, or tell the Owner if the problem continues.";
}

export function ReceiveFlow({ locale, products, onCancel, onSave }: Props) {
  const clothing = useMemo(() => products.filter((product) => product.store === "clothing"), [products]);
  const [form, setForm] = useState(emptyForm);
  const [draft, setDraft] = useState<ReceiptDraft[]>([]);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, string>>({});
  const [customSize, setCustomSize] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const matchingModel = useMemo(() => clothing.filter((product) => product.code.toLowerCase() === form.code.trim().toLowerCase()), [clothing, form.code]);
  const codeSuggestions = unique(clothing.map((product) => product.code)).filter((code) => !form.code || code.toLowerCase().includes(form.code.toLowerCase())).slice(0, 6);
  const colorSuggestions = unique((matchingModel.length ? matchingModel : clothing).map((product) => product.color));
  const knownSizes = unique([...(matchingModel.length ? matchingModel.filter((product) => !form.color || product.color === form.color).map((product) => product.size) : []), ...standardSizes]);
  const selectedSizes = unique([...knownSizes.filter((size) => sizeQuantities[size] !== undefined), ...Object.keys(sizeQuantities)]);

  const set = (key: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const inputClass = "mt-2 h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-violet-500";
  const labelClass = "text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500";

  const chooseCode = (code: string) => {
    const existing = clothing.find((product) => product.code.toLowerCase() === code.toLowerCase());
    setForm((current) => existing ? { ...current, code: existing.code, name: existing.name, brand: existing.brand, category: existing.category, gender: existing.gender, cost: String(existing.cost), currency: existing.currency, supplier: existing.supplier, color: "" } : { ...current, code: code.toUpperCase(), color: "" });
    setSizeQuantities({});
  };

  const toggleSize = (size: string) => setSizeQuantities((current) => current[size] === undefined ? { ...current, [size]: "1" } : Object.fromEntries(Object.entries(current).filter(([key]) => key !== size)));
  const addCustomSize = () => { const size = customSize.trim().toUpperCase(); if (!size) return; setSizeQuantities((current) => ({ ...current, [size]: current[size] ?? "1" })); setCustomSize(""); };
  const baseValid = Boolean(form.code.trim() && form.name.trim() && form.brand.trim() && form.category.trim() && form.color.trim() && Number(form.cost) > 0 && form.supplier.trim());
  const matrixLines = selectedSizes.filter((size) => Number(sizeQuantities[size]) > 0).map((size): ReceiptDraft => ({ code: form.code.trim().toUpperCase(), name: form.name.trim(), brand: form.brand.trim(), category: form.category.trim(), gender: form.gender, color: form.color.trim(), size, cost: Number(form.cost), currency: form.currency, stock: Number(sizeQuantities[size]), supplier: form.supplier.trim(), photos: matchingModel[0]?.photos, store: "clothing" }));

  const addColor = () => {
    if (!baseValid || !matrixLines.length) return;
    setDraft((current) => [...current, ...matrixLines]);
    setForm((current) => ({ ...current, color: "" }));
    setSizeQuantities({});
  };
  const save = async () => {
    const lines = baseValid ? [...draft, ...matrixLines] : draft;
    if (!lines.length || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSave(lines);
    } catch (error) {
      setSaveError(receiptErrorMessage(error, locale));
    } finally {
      setSaving(false);
    }
  };
  const total = [...draft, ...(baseValid ? matrixLines : [])].reduce((sum, line) => sum + line.stock, 0);

  return <div className="p-5 sm:p-7">
    <div className="flex gap-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4"><PackagePlus size={18} className="mt-0.5 shrink-0 text-violet-400" /><div><p className="text-xs font-medium text-zinc-200">Fast size-based receipt</p><p className="mt-1 text-[11px] leading-relaxed text-zinc-500">Enter the model once, choose a color, then set quantities directly for every size received.</p></div></div>

    <div className="mt-6"><label className={labelClass}>1 · Model code / barcode</label><div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-[27px] text-zinc-600" /><input value={form.code} onChange={(event) => chooseCode(event.target.value)} placeholder="KM-9902" className={`${inputClass} pl-9 font-mono uppercase tracking-wide`} autoFocus /></div>{codeSuggestions.length > 0 && form.code && !matchingModel.length && <Chips values={codeSuggestions} onSelect={chooseCode} />}{matchingModel.length > 0 && <p className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400"><Check size={12} /> Existing model found · shared data filled automatically</p>}</div>

    <div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className={labelClass}>Product name</span><input value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="Silk Midi Dress" className={inputClass} /></label><label><span className={labelClass}>Brand</span><input list="brands" value={form.brand} onChange={(event) => set("brand", event.target.value)} placeholder="Zimmermann" className={inputClass} /><datalist id="brands">{unique(clothing.map((p) => p.brand)).map((value) => <option key={value} value={value} />)}</datalist></label><label><span className={labelClass}>Category</span><input list="categories" value={form.category} onChange={(event) => set("category", event.target.value)} placeholder="Dresses" className={inputClass} /><datalist id="categories">{unique(clothing.map((p) => p.category)).map((value) => <option key={value} value={value} />)}</datalist></label><label><span className={labelClass}>Supplier</span><input list="suppliers" value={form.supplier} onChange={(event) => set("supplier", event.target.value)} placeholder="PINO" className={inputClass} /><datalist id="suppliers">{unique(clothing.map((p) => p.supplier)).map((value) => <option key={value} value={value} />)}</datalist></label></div>

    <div className="mt-5"><p className={labelClass}>Gender</p><div className="mt-2 flex gap-2">{genders.map((value) => <button key={value} type="button" onClick={() => set("gender", value)} className={`rounded-lg border px-3 py-2 text-[11px] ${form.gender === value ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}>{value === "women" ? "Women" : value === "men" ? "Men" : "Unisex"}</button>)}</div></div>

    <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_130px]"><label><span className={labelClass}>Purchase cost</span><input type="number" min="0.01" step="0.01" value={form.cost} onChange={(event) => set("cost", event.target.value)} placeholder="0.00" className={inputClass} /></label><label><span className={labelClass}>Currency</span><select value={form.currency} onChange={(event) => set("currency", event.target.value)} className={inputClass}>{currencies.map((value) => <option key={value}>{value}</option>)}</select></label></div>

    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/35 p-4 sm:p-5"><div><p className={labelClass}>2 · Color</p><input value={form.color} onChange={(event) => { set("color", event.target.value); setSizeQuantities({}); }} placeholder="Type or choose a color" className={inputClass} /><Chips values={colorSuggestions} selected={form.color} onSelect={(value) => { set("color", value); setSizeQuantities({}); }} /></div>
      {form.color && <div className="fade-up mt-6"><div className="flex items-end justify-between gap-3"><div><p className={labelClass}>3 · Sizes and quantity</p><p className="mt-1 text-[10px] text-zinc-600">Tap every received size, then adjust its quantity.</p></div><span className="text-[10px] text-violet-400">{matrixLines.reduce((sum, line) => sum + line.stock, 0)} pcs selected</span></div><div className="mt-3 flex flex-wrap gap-2">{knownSizes.map((size) => <button key={size} type="button" onClick={() => toggleSize(size)} className={`min-w-11 rounded-lg border px-3 py-2 text-xs font-semibold ${sizeQuantities[size] !== undefined ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:text-zinc-200"}`}>{size}</button>)}</div><div className="mt-3 flex gap-2"><input value={customSize} onChange={(event) => setCustomSize(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomSize(); } }} placeholder="Other size" className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 text-xs outline-none focus:border-violet-500" /><button type="button" onClick={addCustomSize} className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 px-3 text-[10px] font-semibold text-zinc-400"><Plus size={13} /> Add size</button></div>
        {selectedSizes.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{selectedSizes.map((size) => <div key={size} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/35 p-3"><span className="flex h-9 w-12 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-200">{size}</span><label className="min-w-0 flex-1"><span className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">Quantity</span><input type="number" min="1" value={sizeQuantities[size]} onChange={(event) => setSizeQuantities((current) => ({ ...current, [size]: event.target.value }))} className="mt-1 h-8 w-full rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs outline-none focus:border-violet-500" /></label><button type="button" onClick={() => toggleSize(size)} className="p-2 text-zinc-700 hover:text-red-400"><Trash2 size={14} /></button></div>)}</div>}
      </div>}
    </div>

    <button type="button" disabled={!baseValid || !matrixLines.length} onClick={addColor} className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 text-xs font-semibold text-violet-300 disabled:cursor-not-allowed disabled:opacity-30"><Plus size={15} /> Save this color and add another</button>

    {draft.length > 0 && <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800"><div className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Receipt draft · {draft.length} size rows</div><div className="divide-y divide-zinc-800/70">{draft.map((line, index) => <div key={`${line.code}-${line.color}-${line.size}-${index}`} className="flex items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><p className="truncate text-xs text-zinc-200">{line.color} · size {line.size}</p><p className="mt-1 text-[10px] text-zinc-600">{line.code} · {line.stock} pcs</p></div><button type="button" onClick={() => setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-zinc-700 hover:text-red-400"><Trash2 size={14} /></button></div>)}</div></div>}

    {saveError && <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">{saveError}</p>}
    <div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1.4fr]"><button type="button" disabled={saving} onClick={onCancel} className="h-11 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-zinc-200 disabled:opacity-40">Cancel</button><button type="button" disabled={!total || saving} onClick={save} className="purple-shadow h-11 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Saving…" : `Receive ${total} items`}</button></div>
  </div>;
}
