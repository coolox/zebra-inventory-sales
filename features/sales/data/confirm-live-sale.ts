import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { saleClientError, saleErrorMessage } from "../model/sale-errors";
import type { SaleDraftLine, SalePaymentDraft, SalePricingMode } from "../model/types";
import { toConfirmSaleCommand } from "@/lib/contracts/sales";
import { reportClientFailure } from "@/lib/observability/client";

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

  let command;
  try { command = toConfirmSaleCommand({ storeId, lines, payments, products, pricingMode, idempotencyKey: crypto.randomUUID() }); }
  catch (error) {
    reportClientFailure({ operation: "sale.command", error, context: { lineCount: lines.length, pricingMode } });
    throw new Error(saleClientError("unavailable", locale));
  }

  const { error } = await createClient().rpc("confirm_sale_with_payments", {
    p_store_id: command.storeId,
    p_lines: command.lines.map((line) => line.unitPrice === undefined ? { variant_id: line.variantId, quantity: line.quantity } : { variant_id: line.variantId, quantity: line.quantity, unit_price: line.unitPrice, currency: line.currency }),
    p_payments: command.payments,
    p_idempotency_key: command.idempotencyKey,
    p_pricing_mode: command.pricingMode,
  });

  if (!error) return;
  reportClientFailure({ operation: "sale.confirm", error, correlationId: command.idempotencyKey, context: { lineCount: command.lines.length, paymentCount: command.payments.length, pricingMode: command.pricingMode } });
  throw new Error(saleErrorMessage(error.message, locale));
}
