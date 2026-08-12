import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { saleClientError, saleErrorMessage } from "../model/sale-errors";
import type { SaleDraftLine, SalePaymentDraft, SalePricingMode } from "../model/types";

type ConfirmLiveSaleInput = {
  storeId: string;
  lines: SaleDraftLine[];
  payments: SalePaymentDraft[];
  products: Product[];
  locale: Locale;
  pricingMode: SalePricingMode;
};

export async function confirmLiveSale({ storeId, lines, payments, products, locale, pricingMode }: ConfirmLiveSaleInput) {
  if (!storeId) throw new Error(saleClientError("membership", locale));
  if (!lines.length) return;

  const saleLines = lines.map((line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product?.variantId) throw new Error(saleClientError("unavailable", locale));
    return pricingMode === "sale_total" ? {
      variant_id: product.variantId,
      quantity: line.quantity,
    } : {
      variant_id: product.variantId,
      quantity: line.quantity,
      unit_price: line.price,
      currency: line.currency,
    };
  });

  const { error } = await createClient().rpc("confirm_sale_with_payments", {
    p_store_id: storeId,
    p_lines: saleLines,
    p_payments: payments.map(({ method, amount, currency }) => ({ method, amount, currency })),
    p_idempotency_key: crypto.randomUUID(),
    p_pricing_mode: pricingMode,
  });

  if (!error) return;
  throw new Error(saleErrorMessage(error.message, locale));
}
