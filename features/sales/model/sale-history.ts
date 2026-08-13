import type { Sale, SaleExchange, Seller, StoreId } from "@/lib/types";

export type SaleHistoryRecord = Sale & { status: "confirmed" | "cancelled"; saleId: string; sourceSaleLineId?: string; paymentSnapshot: string; exchange?: SaleExchange };

export function toSaleHistory(sales: Sale[], store: StoreId, sellerId?: Seller["id"], exchanges: SaleExchange[] = []): SaleHistoryRecord[] {
  return sales
    .filter((sale) => sale.store === store && (!sellerId || sale.sellerId === sellerId))
    .map((sale) => {
      const saleId = String(sale.id).split(":")[0];
      const sourceSaleLineId = sale.sourceSaleLineId ?? String(sale.id).split(":")[1];
      const exchange = exchanges.find((item) => item.saleId === saleId && item.sourceSaleLineId === sourceSaleLineId);
      return {
        ...sale,
        saleId,
        sourceSaleLineId,
        status: sale.status ?? "confirmed",
        exchange,
        // Exchange top-up belongs to the original ticket and increases its final EUR total.
        paymentSnapshot: exchange ? new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(sale.revenueEur + exchange.topUpEur) : sale.paymentSnapshot ?? new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(sale.revenueEur),
      };
    })
    .sort((left, right) => left.dayOffset - right.dayOffset || right.time.localeCompare(left.time));
}

export function paginateSaleHistory(items: SaleHistoryRecord[], requestedPage: number, pageSize = 10) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), pageCount);
  return { page, pageCount, items: items.slice((page - 1) * pageSize, page * pageSize) };
}
