import type { Product } from "@/lib/types";

export const saleCurrencies = ["EUR", "USD", "TRY", "RUB", "GBP"] as const;

export type SaleCurrency = (typeof saleCurrencies)[number];

export type SalePricingMode = "per_item" | "sale_total";

export type SaleDraftLine = {
  productId: Product["id"];
  quantity: number;
  price: number | null;
  currency: SaleCurrency | null;
};

export type PaymentMethod = "cash" | "card" | "bank_transfer";

export type SalePaymentDraft = {
  id: string;
  method: PaymentMethod;
  amount: number;
  currency: SaleCurrency;
};
