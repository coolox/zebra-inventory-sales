import type { Product } from "@/lib/types";
import type { CatalogCurrency } from "./catalog";

export type ReceiptLineDto = Omit<Product, "id" | "updated">;

export type ConfirmReceiptCommand = {
  storeId: string;
  model: Pick<ReceiptLineDto, "code" | "name" | "brand" | "category" | "gender" | "supplier" | "barcode">;
  lines: Array<{ color: string; size: string; barcode?: string; quantity: number; unitCost: number; currency: CatalogCurrency }>;
  idempotencyKey: string;
};

export function toConfirmReceiptCommand(storeId: string, lines: ReceiptLineDto[], idempotencyKey: string): ConfirmReceiptCommand | null {
  const first = lines[0];
  if (!first) return null;
  return {
    storeId,
    model: { code: first.code, name: first.name, brand: first.brand, category: first.category, gender: first.gender, supplier: first.supplier, barcode: first.barcode },
    lines: lines.map((line) => ({ color: line.color, size: line.size, barcode: line.variantBarcode, quantity: line.stock, unitCost: line.cost, currency: line.currency })),
    idempotencyKey,
  };
}
