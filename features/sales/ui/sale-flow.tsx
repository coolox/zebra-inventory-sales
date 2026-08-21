"use client";

import { Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { productMatchesCatalogSearch, resolveProductLookup } from "@/features/catalog/model/catalog-search";
import { calculatePaymentsTotalEur, calculateSaleTotalEur, summarizePayments, type PaymentRateMap } from "../model/payments";
import { acceptsFocusedInput, isKeyboardTerminator } from "../model/mobile-input";
import type { PaymentMethod, SaleDraftLine, SalePaymentDraft, SalePricingMode } from "../model/types";
import { PaymentEditor } from "./payment-editor";

type Props = {
  products: Product[];
  sellerName: string;
  locale: Locale;
  paymentRates: PaymentRateMap;
  initialCode?: string;
  onCancel: () => void;
  onComplete: (lines: SaleDraftLine[], payments: SalePaymentDraft[], pricingMode: SalePricingMode) => void | Promise<void>;
};

const currencies: SaleDraftLine["currency"][] = ["EUR", "USD", "TRY", "RUB", "GBP"];

const copy = {
  en: {
    saleBy: "Sale by",
    instructions: "Choose a price type, then enter a model code or barcode, color and size.",
    productCode: "Product code or barcode",
    codeExample: "Scan barcode or enter KM-9902",
    noProduct: "No in-stock product matches this code or barcode.",
    costFrom: "cost from",
    color: "Available color",
    size: "Available size",
    price: "Actual sale price",
    pricingMode: "Price type",
    perItemPrice: "Per-item price",
    perItemPriceHint: "Set the agreed price for each product.",
    totalSalePrice: "Total sale price",
    totalSalePriceHint: "Set one agreed total for all products in this sale.",
    currency: "Currency",
    payment: "Payment method",
    mixedPayment: "Mixed payment",
    mixedPaymentHint: "Split this sale between more than one payment method or currency.",
    reserved: "This size is already in the sale and no more units are available.",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    currentSale: "Current sale",
    item: "item",
    items: "items",
    remove: "Remove item",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    genericError: "Sale could not be saved. Please try again.",
    cancel: "Cancel",
    addAnother: "Add another item",
    saving: "Saving…",
    sell: "Sell",
  },
  tr: {
    saleBy: "Satışı yapan",
    instructions: "Fiyat türünü seçin, ardından model kodu veya barkod, renk ve beden girin.",
    productCode: "Ürün kodu veya barkod",
    codeExample: "Barkodu okutun veya KM-9902 girin",
    noProduct: "Bu kod veya barkodla eşleşen stokta ürün yok.",
    costFrom: "başlangıç maliyeti",
    color: "Mevcut renk",
    size: "Mevcut beden",
    price: "Gerçek satış fiyatı",
    pricingMode: "Fiyat türü",
    perItemPrice: "Ürün başına fiyat",
    perItemPriceHint: "Her ürün için anlaşılan fiyatı belirleyin.",
    totalSalePrice: "Toplam satış fiyatı",
    totalSalePriceHint: "Bu satıştaki tüm ürünler için tek bir toplam belirleyin.",
    currency: "Para birimi",
    payment: "Ödeme yöntemi",
    mixedPayment: "Karma ödeme",
    mixedPaymentHint: "Bu satışı birden fazla ödeme yöntemi veya para birimi arasında bölün.",
    reserved: "Bu beden zaten satışta ve başka ürün kalmadı.",
    cash: "Nakit",
    card: "Kart",
    transfer: "Havale",
    currentSale: "Mevcut satış",
    item: "ürün",
    items: "ürün",
    remove: "Ürünü kaldır",
    decrease: "Adedi azalt",
    increase: "Adedi artır",
    genericError: "Satış kaydedilemedi. Lütfen tekrar deneyin.",
    cancel: "İptal",
    addAnother: "Başka ürün ekle",
    saving: "Kaydediliyor…",
    sell: "Sat",
  },
} as const;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function SaleFlow({ products, sellerName, locale, paymentRates, initialCode = "", onCancel, onComplete }: Props) {
  const text = copy[locale];
  const available = useMemo(() => products.filter((product) => product.store === "clothing" && product.stock > 0), [products]);
  const [code, setCode] = useState(initialCode);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<SaleDraftLine["currency"]>("EUR");
  const [pricingMode, setPricingMode] = useState<SalePricingMode | null>(null);
  const [saleTotalPrice, setSaleTotalPrice] = useState("");
  const [saleTotalCurrency, setSaleTotalCurrency] = useState<SaleDraftLine["currency"]>("EUR");
  const [cart, setCart] = useState<SaleDraftLine[]>([]);
  const [payments, setPayments] = useState<SalePaymentDraft[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [mixedPayment, setMixedPayment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const modelVariants = useMemo(() => resolveProductLookup(available, code), [available, code]);
  const colors = unique(modelVariants.map((product) => product.color));
  const sizes = unique(modelVariants.filter((product) => product.color === color).map((product) => product.size));
  const selected = modelVariants.find((product) => product.color === color && product.size === size);
  const suggestedCodes = unique(available.filter((product) => productMatchesCatalogSearch(product, code)).map((product) => product.code)).slice(0, 5);
  const selectedReserved = selected ? cart.filter((line) => line.productId === selected.id).reduce((sum, line) => sum + line.quantity, 0) : 0;
  const selectedHasStock = Boolean(selected && selectedReserved < selected.stock);
  const mixedPaymentTotalEur = useMemo(() => calculatePaymentsTotalEur(payments, paymentRates), [payments, paymentRates]);
  const derivesSingleItemPrice = pricingMode === "per_item" && mixedPayment && cart.length === 0 && Boolean(selected);
  const selectedPrice = derivesSingleItemPrice ? mixedPaymentTotalEur : Number(price);
  const selectedCurrency = derivesSingleItemPrice ? "EUR" : currency;
  const selectedLine = pricingMode && selected && selectedHasStock && (pricingMode === "sale_total" || selectedPrice !== null && selectedPrice > 0)
    ? { productId: selected.id, quantity: 1, price: pricingMode === "per_item" ? selectedPrice : null, currency: pricingMode === "per_item" ? selectedCurrency : null }
    : null;
  const canAdd = Boolean(selectedLine);
  const saleLines = selectedLine ? [...cart, selectedLine] : cart;
  const totalItems = saleLines.reduce((sum, line) => sum + line.quantity, 0);
  const perItemTotalEur = useMemo(() => calculateSaleTotalEur(saleLines, paymentRates), [saleLines, paymentRates]);
  const simplePayment: SalePaymentDraft = pricingMode === "sale_total" ? {
    id: "single-payment",
    method: paymentMethod,
    amount: Number(saleTotalPrice),
    currency: saleTotalCurrency ?? "EUR",
  } : {
    id: "single-payment",
    method: paymentMethod,
    amount: cart.length ? perItemTotalEur ?? 0 : selectedLine?.price ?? 0,
    currency: cart.length ? "EUR" : selectedLine?.currency ?? currency ?? "EUR",
  };
  const paymentLines = mixedPayment ? payments : [simplePayment];
  const saleTotalEur = pricingMode === "sale_total"
    ? calculatePaymentsTotalEur(paymentLines, paymentRates)
    : perItemTotalEur;
  const paymentSummary = useMemo(
    () => summarizePayments(paymentLines, saleTotalEur, paymentRates),
    [paymentLines, saleTotalEur, paymentRates],
  );

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
    setSaveError("");
  };
  const handleFocusedValueChange = (event: ChangeEvent<HTMLInputElement>, setValue: (value: string) => void) => {
    if (acceptsFocusedInput(event)) setValue(event.target.value);
  };
  const dismissKeyboard = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isKeyboardTerminator(event.key) || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.blur();
  };

  const addCurrent = () => {
    if (!pricingMode || !selected || (pricingMode === "per_item" && Number(price) <= 0)) return false;
    const alreadyReserved = cart.filter((line) => line.productId === selected.id).reduce((sum, line) => sum + line.quantity, 0);
    if (alreadyReserved >= selected.stock) return false;

    setCart((current) => {
      const nextPrice = pricingMode === "per_item" ? Number(price) : null;
      const nextCurrency = pricingMode === "per_item" ? currency : null;
      const existing = current.find((line) => line.productId === selected.id && line.price === nextPrice && line.currency === nextCurrency);
      if (existing) {
        return current.map((line) => line === existing && line.quantity < selected.stock ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { productId: selected.id, quantity: 1, price: nextPrice, currency: nextCurrency }];
    });
    return true;
  };

  const addAnother = () => {
    if (addCurrent()) resetPicker();
  };

  const toggleMixedPayment = (checked: boolean) => {
    setMixedPayment(checked);
    setPaymentMethod("cash");
    setPayments(checked ? [
      { id: "mixed-payment-1", method: "cash", amount: 0, currency: "EUR" },
      { id: "mixed-payment-2", method: "card", amount: 0, currency: "EUR" },
    ] : []);
  };

  const sellNow = async () => {
    if (!pricingMode || !saleLines.length || !paymentSummary.isValid || saving) return;

    setSaving(true);
    setSaveError("");
    try {
      await onComplete(saleLines, paymentLines, pricingMode);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : text.genericError);
    } finally {
      setSaving(false);
    }
  };

  const changeQuantity = (target: SaleDraftLine, delta: number) => {
    const product = products.find((item) => item.id === target.productId);
    if (!product) return;
    setCart((current) => {
      const reservedByOtherLines = current
        .filter((line) => line !== target && line.productId === target.productId)
        .reduce((sum, line) => sum + line.quantity, 0);
      return current.map((line) => line === target
        ? { ...line, quantity: Math.max(1, Math.min(product.stock - reservedByOtherLines, line.quantity + delta)) }
        : line);
    });
  };

  const itemLabel = (count: number) => count === 1 ? text.item : text.items;

  return (
    <div className="p-5 sm:p-7">
      <div className="flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
        <div>
          <p className="text-xs font-medium text-zinc-200">{text.saleBy} {sellerName}</p>
          <p className="mt-1 text-[11px] text-zinc-500">{text.instructions}</p>
        </div>
        <ShoppingBag size={19} className="text-violet-400" />
      </div>

      <fieldset className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">1 · {text.pricingMode}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["per_item", "sale_total"] as SalePricingMode[]).map((mode) => {
            const active = pricingMode === mode;
            const label = mode === "per_item" ? text.perItemPrice : text.totalSalePrice;
            const hint = mode === "per_item" ? text.perItemPriceHint : text.totalSalePriceHint;
            return <button key={mode} type="button" disabled={cart.length > 0 || saving} aria-pressed={active} onClick={() => { setPricingMode(mode); setPrice(""); setCurrency("EUR"); setMixedPayment(false); setPayments([]); setSaleTotalPrice(""); }} className={`rounded-lg border p-3 text-left transition disabled:cursor-not-allowed ${active ? "theme-selected border-violet-500 bg-violet-500/15" : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"}`}><span className={`block text-xs font-semibold ${active ? "text-violet-200" : "text-zinc-300"}`}>{label}</span><span className="mt-1 block text-[10px] leading-relaxed text-zinc-500">{hint}</span></button>;
          })}
        </div>
      </fieldset>

      {pricingMode && <div className="mt-6">
        <label htmlFor="sale-product-code" className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">2 · {text.productCode}</label>
        <div className="relative mt-2">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input id="sale-product-code" value={code} onChange={(event) => { if (acceptsFocusedInput(event)) chooseCode(event.target.value.toUpperCase()); }} onKeyDown={dismissKeyboard} placeholder={text.codeExample} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-3 font-mono text-sm uppercase tracking-wide text-zinc-100 outline-none focus:border-violet-500" autoFocus />
        </div>
        {code && !modelVariants.length && suggestedCodes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">{suggestedCodes.map((item) => <button key={item} type="button" onClick={() => chooseCode(item)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[11px] text-zinc-400 hover:border-violet-500/40 hover:text-violet-300">{item}</button>)}</div>
        )}
        {code && !modelVariants.length && !suggestedCodes.length && <p className="mt-2 text-xs text-amber-400">{text.noProduct}</p>}
      </div>}

      {pricingMode && modelVariants.length > 0 && (
        <div className="fade-up mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-sm font-medium text-zinc-100">{modelVariants[0].name}</p>
          <p className="mt-1 text-[11px] text-zinc-500">{modelVariants[0].brand} · {text.costFrom} {modelVariants[0].cost} {modelVariants[0].currency}</p>
        </div>
      )}

      {pricingMode && colors.length > 0 && (
        <div className="fade-up mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">3 · {text.color}</p>
          <div className="mt-2 flex flex-wrap gap-2">{colors.map((item) => <button key={item} type="button" onClick={() => { setColor(item); setSize(""); }} className={`rounded-lg border px-3.5 py-2.5 text-xs font-medium transition ${color === item ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"}`}>{item}</button>)}</div>
        </div>
      )}

      {pricingMode && color && sizes.length > 0 && (
        <div className="fade-up mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">4 · {text.size}</p>
          <div className="mt-2 flex flex-wrap gap-2">{sizes.map((item) => {
            const variant = modelVariants.find((product) => product.color === color && product.size === item)!;
            return <button key={item} type="button" onClick={() => setSize(item)} className={`min-w-12 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${size === item ? "theme-selected border-violet-500 bg-violet-500/15 text-violet-200" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"}`}>{item}<span className="ml-2 text-[9px] font-normal text-zinc-600">{variant.stock}</span></button>;
          })}</div>
        </div>
      )}

      {pricingMode === "per_item" && (selected || cart.length > 0) && (
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
          <input aria-label={text.mixedPayment} type="checkbox" checked={mixedPayment} onChange={(event) => toggleMixedPayment(event.target.checked)} disabled={saving} className="mt-0.5 h-4 w-4 accent-violet-500" />
          <span><span className="block font-semibold text-zinc-100">{text.mixedPayment}</span><span className="mt-1 block text-[11px] leading-relaxed text-zinc-500">{text.mixedPaymentHint}</span></span>
        </label>
      )}

      {selected && pricingMode === "per_item" && !derivesSingleItemPrice && (
        <div className="fade-up mt-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">5 · {text.price}</span><input type="number" min="0.01" step="0.01" value={price} onChange={(event) => handleFocusedValueChange(event, setPrice)} onKeyDown={dismissKeyboard} placeholder="0.00" className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500" /></label>
            <label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.currency}</span><select value={currency ?? "EUR"} onChange={(event) => setCurrency(event.target.value as SaleDraftLine["currency"])} className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-200 outline-none focus:border-violet-500">{currencies.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          {Number(price) > 0 && !selectedHasStock && <p role="status" className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{text.reserved}</p>}
        </div>
      )}

      {cart.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.currentSale}</p><span className="text-[10px] text-violet-400">{totalItems} {itemLabel(totalItems)}</span></div>
          <div className="divide-y divide-zinc-800/70">{saleLines.map((line) => {
            const product = products.find((item) => item.id === line.productId);
            if (!product) return null;
            const isPendingPickerLine = line === selectedLine;
            return <div key={`${line.productId}-${line.price}-${line.currency}-${isPendingPickerLine ? "picker" : "cart"}`} className="flex items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">{product.name}</p><p className="mt-1 text-[10px] text-zinc-600">{product.code} · {product.color} · {product.size} · {line.price === null ? text.totalSalePrice : `${line.price} ${line.currency}`}</p></div>{isPendingPickerLine ? <button type="button" onClick={resetPicker} className="p-2 text-zinc-700 hover:text-red-400" aria-label={text.remove}><Trash2 size={15} /></button> : <><div className="flex items-center rounded-lg border border-zinc-800"><button type="button" onClick={() => changeQuantity(line, -1)} className="p-2 text-zinc-500 hover:text-white" aria-label={text.decrease}><Minus size={12} /></button><span className="min-w-5 text-center text-[11px]">{line.quantity}</span><button type="button" onClick={() => changeQuantity(line, 1)} className="p-2 text-zinc-500 hover:text-white" aria-label={text.increase}><Plus size={12} /></button></div><button type="button" onClick={() => setCart((current) => current.filter((item) => item !== line))} className="p-2 text-zinc-700 hover:text-red-400" aria-label={text.remove}><Trash2 size={15} /></button></>}</div>;
          })}</div>
        </div>
      )}

      {saleLines.length > 0 && (pricingMode === "sale_total" || !mixedPayment) && (
        <section className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4" aria-label={`${text.payment} options`}>
          {pricingMode === "sale_total" && <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/30 p-3 text-xs text-zinc-300">
            <input aria-label={text.mixedPayment} type="checkbox" checked={mixedPayment} onChange={(event) => toggleMixedPayment(event.target.checked)} disabled={saving} className="mt-0.5 h-4 w-4 accent-violet-500" />
            <span><span className="block font-semibold text-zinc-100">{text.mixedPayment}</span><span className="mt-1 block text-[11px] leading-relaxed text-zinc-500">{text.mixedPaymentHint}</span></span>
          </label>}

          {!mixedPayment && pricingMode === "sale_total" && <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
            <label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.totalSalePrice}</span><input aria-label={text.totalSalePrice} type="number" min="0.01" step="0.01" value={saleTotalPrice} onChange={(event) => handleFocusedValueChange(event, setSaleTotalPrice)} onKeyDown={dismissKeyboard} placeholder="0.00" className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500" /></label>
            <label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.currency}</span><select value={saleTotalCurrency ?? "EUR"} onChange={(event) => setSaleTotalCurrency(event.target.value as SaleDraftLine["currency"])} className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-xs text-zinc-200 outline-none focus:border-violet-500">{currencies.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>}

          {!mixedPayment && <label htmlFor="sale-payment-method" className="mt-4 block max-w-sm"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{text.payment}</span><select id="sale-payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} disabled={saving} className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-xs text-zinc-200 outline-none focus:border-violet-500 disabled:opacity-50"><option value="cash">{text.cash}</option><option value="card">{text.card}</option><option value="bank_transfer">{text.transfer}</option></select></label>}
        </section>
      )}

      {mixedPayment && (pricingMode === "per_item" ? Boolean(selected || cart.length > 0) : saleLines.length > 0) && <PaymentEditor locale={locale} payments={payments} totalEur={pricingMode === "per_item" ? perItemTotalEur : saleTotalEur} rates={paymentRates} deriveTotal={pricingMode === "sale_total" || derivesSingleItemPrice} disabled={saving} onChange={setPayments} />}

      {saveError && <p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">{saveError}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1fr_1.2fr]">
        <button type="button" disabled={saving} onClick={onCancel} className="h-11 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-zinc-200 disabled:opacity-40">{text.cancel}</button>
        <button type="button" disabled={!canAdd} onClick={addAnother} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 disabled:cursor-not-allowed disabled:opacity-30"><Plus size={15} /> {text.addAnother}</button>
        <button type="button" disabled={saving || !saleLines.length || !paymentSummary.isValid} onClick={() => void sellNow()} className="purple-shadow h-11 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30">{saving ? text.saving : totalItems ? `${text.sell} ${totalItems} ${itemLabel(totalItems)}` : text.sell}</button>
      </div>
    </div>
  );
}
