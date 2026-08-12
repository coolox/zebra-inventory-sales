import type { Product } from "@/lib/types";

export const saleCurrencies = ["EUR", "USD", "TRY", "RUB", "GBP"] as const;
export type SaleCurrency = (typeof saleCurrencies)[number];
export type SalePricingMode = "per_item" | "sale_total";
export type PaymentMethod = "cash" | "card" | "bank_transfer";

export type SaleDraftLineDto = { productId: Product["id"]; quantity: number; price: number | null; currency: SaleCurrency | null };
export type SalePaymentDto = { id: string; method: PaymentMethod; amount: number; currency: SaleCurrency };

export type ConfirmSaleCommand = {
  storeId: string;
  pricingMode: SalePricingMode;
  lines: Array<{ variantId: string; quantity: number; unitPrice?: number | null; currency?: SaleCurrency | null }>;
  payments: Array<Omit<SalePaymentDto, "id">>;
  idempotencyKey: string;
};

export type SaleLifecycleDto = {
  saleId: string;
  sourceSaleId?: string;
  kind: "sale" | "cancellation" | "exchange";
  occurredAt: string;
};

/** Money uses decimal major units; EUR payment reconciliation tolerance is €0.01. */
export const paymentToleranceEur = 0.01;

export function toConfirmSaleCommand(input: {
  storeId: string; pricingMode: SalePricingMode; lines: SaleDraftLineDto[]; payments: SalePaymentDto[]; products: Product[]; idempotencyKey: string;
}): ConfirmSaleCommand {
  const lines = input.lines.map((line) => {
    const product = input.products.find((item) => item.id === line.productId);
    if (!product?.variantId) throw new Error("Sale variant is unavailable.");
    return input.pricingMode === "sale_total"
      ? { variantId: product.variantId, quantity: line.quantity }
      : { variantId: product.variantId, quantity: line.quantity, unitPrice: line.price, currency: line.currency };
  });
  return { storeId: input.storeId, pricingMode: input.pricingMode, lines, payments: input.payments.map(({ method, amount, currency }) => ({ method, amount, currency })), idempotencyKey: input.idempotencyKey };
}
