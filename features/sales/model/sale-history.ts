import type { Sale, Seller, StoreId } from "@/lib/types";

export type SaleHistoryRecord = Sale & { status: "confirmed" | "cancelled"; saleId: string; sourceSaleLineId?: string; paymentSnapshot: string };

export function toSaleHistory(sales: Sale[], store: StoreId, sellerId?: Seller["id"]): SaleHistoryRecord[] {
  return sales
    .filter((sale) => sale.store === store && (!sellerId || sale.sellerId === sellerId))
    .map((sale) => ({
      ...sale,
      saleId: String(sale.id).split(":")[0],
      sourceSaleLineId: sale.sourceSaleLineId ?? String(sale.id).split(":")[1],
      status: sale.status ?? "confirmed",
      // The source Sale already contains its persisted EUR snapshot. Never derive it from today's FX rate.
      paymentSnapshot: sale.paymentSnapshot ?? new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(sale.revenueEur),
    }))
    .sort((left, right) => left.dayOffset - right.dayOffset || right.time.localeCompare(left.time));
}

export function paginateSaleHistory(items: SaleHistoryRecord[], requestedPage: number, pageSize = 10) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), pageCount);
  return { page, pageCount, items: items.slice((page - 1) * pageSize, page * pageSize) };
}
