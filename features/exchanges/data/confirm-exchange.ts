import type { Locale } from "@/lib/i18n";
import { toExchangeSaleCommand } from "@/lib/contracts/sales";
import { createClient } from "@/lib/supabase/client";

export async function confirmExchange(input: Parameters<typeof toExchangeSaleCommand>[0] & { locale: Locale }) {
  let command;
  try { command = toExchangeSaleCommand(input); }
  catch { throw new Error(input.locale === "tr" ? "Değişim nedeni ve ürün bilgileri zorunludur." : "An exchange reason and product details are required."); }
  const { error } = await createClient().rpc("exchange_sale_line", {
    p_store_id: command.storeId,
    p_source_sale_line_id: command.sourceSaleLineId,
    p_replacement_variant_id: command.replacementVariantId,
    p_quantity: command.quantity,
    p_replacement_unit_price: command.replacementUnitPrice,
    p_replacement_currency: command.replacementCurrency,
    p_payments: command.payments,
    p_reason: command.reason,
    p_idempotency_key: command.idempotencyKey,
  });
  if (!error) return;
  throw new Error(input.locale === "tr" ? "Değişim kaydedilemedi. Stoku ve ödemeyi kontrol edip tekrar deneyin." : "Exchange could not be saved. Check stock and payment, then try again.");
}
