import type { Locale } from "@/lib/i18n";

const errors = {
  en: {
    membership: "Missing store membership.",
    unavailable: "Selected product is no longer available. Refresh the catalog and try again.",
    stock: "This size has just sold out. Refresh the catalog and try again.",
    rate: "Today’s exchange rate for this sale currency is missing. Ask the Owner to save it first.",
    duplicate: "The same product, price and currency can be added only once. Adjust its quantity instead.",
    cost: "This product has no purchase cost. Ask the Owner to complete its receipt first.",
    access: "You do not have access to save a sale in this store.",
    validation: "Check the sale items and payment amounts, then try again.",
    payment: "Payment total must exactly match the sale total.",
    cancellation: "This sale cannot be cancelled. Refresh the history and try again.",
    generic: "Sale could not be saved. Please try again.",
  },
  tr: {
    membership: "Mağaza yetkilendirmesi bulunamadı.",
    unavailable: "Seçilen ürün artık mevcut değil. Kataloğu yenileyip tekrar deneyin.",
    stock: "Bu beden az önce tükendi. Kataloğu yenileyip tekrar deneyin.",
    rate: "Bu satış para birimi için bugünün kuru eksik. Mağaza sahibinden kuru kaydetmesini isteyin.",
    duplicate: "Aynı ürün, fiyat ve para birimi yalnızca bir kez eklenebilir. Adedini değiştirin.",
    cost: "Bu ürünün alış maliyeti yok. Önce kabul kaydını tamamlaması için mağaza sahibine bildirin.",
    access: "Bu mağazada satış kaydetme yetkiniz yok.",
    validation: "Satış ürünlerini ve ödeme tutarlarını kontrol edip tekrar deneyin.",
    payment: "Ödeme toplamı satış toplamıyla tam olarak eşleşmelidir.",
    cancellation: "Bu satış iptal edilemez. Geçmişi yenileyip tekrar deneyin.",
    generic: "Satış kaydedilemedi. Lütfen tekrar deneyin.",
  },
} as const;

export function saleErrorMessage(message: string | undefined, locale: Locale) {
  const text = errors[locale];
  const source = message ?? "";
  if (/Insufficient stock/i.test(source)) return text.stock;
  if (/exchange rate/i.test(source)) return text.rate;
  if (/duplicate key|sale_lines_sale_id_variant_id/i.test(source)) return text.duplicate;
  if (/no purchase cost/i.test(source)) return text.cost;
  if (/No access|Authentication is required/i.test(source)) return text.access;
  if (/Payment total|At least one payment|Payment amount|Invalid payment/i.test(source)) return text.payment;
  if (/Sale is already cancelled|Sale cancellation reason|required|Sale not found/i.test(source)) return text.cancellation;
  if (/Invalid sale line|Sale quantity|Sale lines and idempotency|required/i.test(source)) return text.validation;
  return text.generic;
}

export function saleClientError(key: "membership" | "unavailable", locale: Locale) {
  return errors[locale][key];
}
