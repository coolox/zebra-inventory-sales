import type { Locale } from "@/lib/i18n";

const errors = {
  en: {
    membership: "Missing store membership.",
    rate: "Today’s exchange rate for this currency is missing. Save it in Owner settings, then try again.",
    access: "You do not have permission for this store. Sign in with the Owner account and try again.",
    validation: "Some product details are missing or invalid. Check the model, color, size, quantity and cost.",
    duplicate: "This receipt request was already processed. Refresh the workspace before trying again.",
    generic: "Receipt could not be saved. Try again, or tell the Owner if the problem continues.",
  },
  tr: {
    membership: "Mağaza yetkilendirmesi bulunamadı.",
    rate: "Bu para birimi için bugünün döviz kuru bulunamadı. Sahip ayarlarından kuru kaydedip tekrar deneyin.",
    access: "Bu işlem için mağaza erişiminiz yok. Sahip hesabıyla tekrar giriş yapın.",
    validation: "Bazı ürün bilgileri eksik veya geçersiz. Model, renk, beden, miktar ve maliyeti kontrol edin.",
    duplicate: "Bu kabul isteği zaten işlendi. Yeniden denemeden önce çalışma alanını yenileyin.",
    generic: "Kabul kaydedilemedi. Lütfen tekrar deneyin. Sorun sürerse sahibine bildirin.",
  },
} as const;

export function receiptErrorMessage(message: string | undefined, locale: Locale) {
  const text = errors[locale];
  const source = message ?? "";
  if (/exchange rate/i.test(source)) return text.rate;
  if (/No access to this store|Only an Owner|Authentication is required/i.test(source)) return text.access;
  if (/duplicate key|idempotency|already processed/i.test(source)) return text.duplicate;
  if (/New model requires|Model code is required|Each receipt line requires|Invalid receipt line|Receipt quantity|Duplicate color and size/i.test(source)) return text.validation;
  return text.generic;
}

export function receiptClientError(key: "membership", locale: Locale) {
  return errors[locale][key];
}
