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

export type CancelSaleCommand = {
  storeId: string;
  saleId: string;
  reason: string;
};

export type ExchangePaymentDto = Omit<SalePaymentDto, "id">;
export type ExchangeSaleCommand = {
  storeId: string;
  sourceSaleLineId: string;
  replacementVariantId: string;
  quantity: number;
  replacementUnitPrice: number;
  replacementCurrency: SaleCurrency;
  payments: ExchangePaymentDto[];
  reason: string;
  idempotencyKey: string;
};

export function toExchangeSaleCommand(input: ExchangeSaleCommand): ExchangeSaleCommand {
  const reason = input.reason.trim();
  if (!input.storeId || !input.sourceSaleLineId || !input.replacementVariantId || !reason || !input.idempotencyKey || !Number.isInteger(input.quantity) || input.quantity <= 0 || !Number.isFinite(input.replacementUnitPrice) || input.replacementUnitPrice <= 0) {
    throw new Error("A source line, replacement, positive quantity/price, reason and idempotency key are required.");
  }
  return { ...input, reason, payments: input.payments.map((payment) => ({ ...payment })) };
}

export function toCancelSaleCommand(input: CancelSaleCommand): CancelSaleCommand {
  const reason = input.reason.trim();
  if (!input.storeId || !input.saleId || !reason) throw new Error("Sale and cancellation reason are required.");
  return { ...input, reason };
}

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
