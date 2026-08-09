"use client";

import { Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";

export type SaleDraftLine = {
  productId: number;
  quantity: number;
  price: number;
  currency: "EUR" | "USD" | "TRY" | "RUB" | "GBP";
};
export type PaymentMethod = "cash" | "card" | "bank_transfer";

type Props = {
  products: Product[];
  sellerName: string;
  initialCode?: string;
  onCancel: () => void;
  onComplete: (lines: SaleDraftLine[], paymentMethod: PaymentMethod) => void | Promise<void>;
};

const currencies: SaleDraftLine["currency"][] = ["EUR", "USD", "TRY", "RUB", "GBP"];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function SaleFlow({ products, sellerName, initialCode = "", onCancel, onComplete }: Props) {
  const available = useMemo(() => products.filter((product) => product.store === "clothing" && product.stock > 0), [products]);
  const codes = useMemo(() => unique(available.map((product) => product.code)), [available]);
  const [code, setCode] = useState(initialCode);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<SaleDraftLine["currency"]>("EUR");
  const [cart, setCart] = useState<SaleDraftLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const modelVariants = useMemo(
    () => available.filter((product) => product.code.toLowerCase() === code.trim().toLowerCase()),
    [available, code],
  );
  const colors = unique(modelVariants.map((product) => product.color));
  const sizes = unique(modelVariants.filter((product) => product.color === color).map((product) => product.size));
  const selected = modelVariants.find((product) => product.color === color && product.size === size);

  const resetPicker = () => {
    setCode("");
    setColor("");
    setSize("");
    setPrice("");
    setCurrency("EUR");
  };

  const chooseCode = (nextCode: string) => {
    setCode(nextCode);
    setColor("");
    setSize("");
    setPrice("");
  };

  const addCurrent = () => {
    if (!selected || !Number(price)) return false;
    const alreadyReserved = cart.filter((line) => line.productId === selected.id).reduce((sum, line) => sum + line.quantity, 0);
    if (alreadyReserved >= selected.stock) return false;
    setCart((current) => {
      const existing = current.find((line) => line.productId === selected.id && line.price === Number(price) && line.currency === currency);
      if (existing) {
        return current.map((line) => line === existing && line.quantity < selected.stock ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { productId: selected.id, quantity: 1, price: Number(price), currency }];
    });
    return true;
  };

  const addAnother = () => {
    if (addCurrent()) resetPicker();
  };

  const sellNow = async () => {
    let finalCart = cart;
    if (selected && Number(price)) {
      const alreadyReserved = cart.filter((line) => line.productId === selected.id).reduce((sum, line) => sum + line.quantity, 0);
      if (alreadyReserved >= selected.stock) {
        if (!cart.length) return;
        finalCart = cart;
      } else {
        const currentLine: SaleDraftLine = { productId: selected.id, quantity: 1, price: Number(price), currency };
        const existing = cart.find((line) => line.productId === currentLine.productId && line.price === currentLine.price && line.currency === currentLine.currency);
        finalCart = existing
          ? cart.map((line) => line === existing ? { ...line, quantity: Math.min(selected.stock, line.quantity + 1) } : line)
          : [...cart, currentLine];
      }
    }
    if (!finalCart.length || saving) return;
    setSaving(true);
    setSaveError("");
    try { await onComplete(finalCart, paymentMethod); } catch (error) { setSaveError(error instanceof Error ? error.message : "Sale could not be saved. Please try again."); } finally { setSaving(false); }
  };

  const changeQuantity = (target: SaleDraftLine, delta: number) => {
    const productId = target.productId;
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setCart((current) => {
      const reservedByOtherLines = current.filter((line) => line !== target && line.productId === productId).reduce((sum, line) => sum + line.quantity, 0);
      return current.map((line) => line === target ? { ...line, quantity: Math.max(1, Math.min(product.stock - reservedByOtherLines, line.quantity + delta)) } : line);
    });
  };

  const suggestedCodes = codes.filter((item) => !code || item.toLowerCase().includes(code.toLowerCase())).slice(0, 5);
  const selectedReserved = selected ? cart.filter((line) => line.productId === selected.id).reduce((sum, line) => sum + line.quantity, 0) : 0;
  const canAdd = Boolean(selected && Number(price) && selectedReserved < selected.stock);
  const totalItems = cart.reduce((sum, line) => sum + line.quantity, 0) + (canAdd ? 1 : 0);

  return (
    <div className="p-5 sm:p-7">
      <div className="flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
        <div>
          <p className="text-xs font-medium text-zinc-200">Sale by {sellerName}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Enter a model code, then choose an available color and size.</p>
        </div>
        <ShoppingBag size={19} className="text-violet-400" />
      </div>

      <div className="mt-6">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">1 · Product code</label>
        <div className="relative mt-2">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input value={code} onChange={(event) => chooseCode(event.target.value.toUpperCase())} placeholder="For example, KM-9902" className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-3 font-mono text-sm uppercase tracking-wide text-zinc-100 outline-none focus:border-violet-500" autoFocus />
        </div>
        {code && !modelVariants.length && suggestedCodes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">{suggestedCodes.map((item) => <button key={item} type="button" onClick={() => chooseCode(item)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[11px] text-zinc-400 hover:border-violet-500/40 hover:text-violet-300">{item}</button>)}</div>
        )}
      </div>

      {modelVariants.length > 0 && (
        <div className="fade-up mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-sm font-medium text-zinc-100">{modelVariants[0].name}</p>
          <p className="mt-1 text-[11px] text-zinc-500">{modelVariants[0].brand} · cost from {modelVariants[0].cost} {modelVariants[0].currency}</p>
        </div>
      )}

      {colors.length > 0 && (
        <div className="fade-up mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">2 · Available color</p>
          <div className="mt-2 flex flex-wrap gap-2">{colors.map((item) => <button key={item} type="button" onClick={() => { setColor(item); setSize(""); }} className={`rounded-lg border px-3.5 py-2.5 text-xs font-medium transition ${color === item ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"}`}>{item}</button>)}</div>
        </div>
      )}

      {color && sizes.length > 0 && (
        <div className="fade-up mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">3 · Available size</p>
          <div className="mt-2 flex flex-wrap gap-2">{sizes.map((item) => { const variant = modelVariants.find((product) => product.color === color && product.size === item)!; return <button key={item} type="button" onClick={() => setSize(item)} className={`min-w-12 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${size === item ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"}`}>{item}<span className="ml-2 text-[9px] font-normal text-zinc-600">{variant.stock}</span></button>; })}</div>
        </div>
      )}

      {selected && (
        <div className="fade-up mt-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]"><label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">4 · Actual sale price</span><input type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500" /></label><label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value as SaleDraftLine["currency"])} className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-200 outline-none focus:border-violet-500">{currencies.map((item) => <option key={item}>{item}</option>)}</select></label></div>
          <div className="mt-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Payment method</p><div className="mt-2 grid grid-cols-3 gap-2">{([['cash', 'Cash'], ['card', 'Card'], ['bank_transfer', 'Transfer']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setPaymentMethod(value)} className={`h-10 rounded-lg border text-xs font-medium ${paymentMethod === value ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}>{label}</button>)}</div></div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Current sale</p><span className="text-[10px] text-violet-400">{cart.reduce((sum, line) => sum + line.quantity, 0)} items</span></div>
          <div className="divide-y divide-zinc-800/70">{cart.map((line) => { const product = products.find((item) => item.id === line.productId)!; return <div key={`${line.productId}-${line.price}-${line.currency}`} className="flex items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">{product.name}</p><p className="mt-1 text-[10px] text-zinc-600">{product.code} · {product.color} · {product.size} · {line.price} {line.currency}</p></div><div className="flex items-center rounded-lg border border-zinc-800"><button type="button" onClick={() => changeQuantity(line, -1)} className="p-2 text-zinc-500 hover:text-white"><Minus size={12} /></button><span className="min-w-5 text-center text-[11px]">{line.quantity}</span><button type="button" onClick={() => changeQuantity(line, 1)} className="p-2 text-zinc-500 hover:text-white"><Plus size={12} /></button></div><button type="button" onClick={() => setCart((current) => current.filter((item) => item !== line))} className="p-2 text-zinc-700 hover:text-red-400" aria-label="Remove item"><Trash2 size={15} /></button></div>; })}</div>
        </div>
      )}

      {saveError && <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">{saveError}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1fr_1.2fr]">
        <button type="button" disabled={saving} onClick={onCancel} className="h-11 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-zinc-200 disabled:opacity-40">Cancel</button>
        <button type="button" disabled={!canAdd} onClick={addAnother} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 disabled:cursor-not-allowed disabled:opacity-30"><Plus size={15} /> Add another item</button>
        <button type="button" disabled={saving || (!cart.length && !canAdd)} onClick={() => void sellNow()} className="purple-shadow h-11 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Saving…" : `Sell ${totalItems || ""} ${totalItems === 1 ? "item" : "items"}`}</button>
      </div>
    </div>
  );
}
