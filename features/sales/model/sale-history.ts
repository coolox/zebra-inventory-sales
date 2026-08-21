import type { EntityId, Sale, SaleExchange, Seller, StoreId } from "@/lib/types";

export type SaleHistoryLine = Sale & {
  status: "confirmed" | "cancelled";
  saleId: string;
  sourceSaleLineId?: string;
  paymentSnapshot: string;
  exchange?: SaleExchange;
  photoUrl?: string;
};

export type SaleHistoryRecord = {
  id: string;
  saleId: string;
  sellerId: EntityId;
  seller: string;
  store: StoreId;
  status: "confirmed" | "cancelled";
  quantity: number;
  revenueEur: number;
  marginEur: number;
  paymentSnapshot: string;
  ticketTotalSnapshot: string;
  dayOffset: number;
  time: string;
  lines: SaleHistoryLine[];
};

const formatEur = (value: number) => new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
}).format(value);

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export function toSaleHistory(
  sales: Sale[],
  store: StoreId,
  sellerId?: Seller["id"],
  exchanges: SaleExchange[] = [],
): SaleHistoryRecord[] {
  const grouped = new Map<string, SaleHistoryLine[]>();

  sales
    .filter((sale) => sale.store === store && (!sellerId || sale.sellerId === sellerId))
    .forEach((sale) => {
      const [saleId, fallbackLineId] = String(sale.id).split(":");
      const sourceSaleLineId = sale.sourceSaleLineId ?? fallbackLineId;
      const exchange = exchanges.find((item) => item.saleId === saleId && item.sourceSaleLineId === sourceSaleLineId);
      const line: SaleHistoryLine = {
        ...sale,
        saleId,
        sourceSaleLineId,
        status: sale.status ?? "confirmed",
        paymentSnapshot: sale.paymentSnapshot ?? formatEur(sale.revenueEur),
        exchange,
      };
      grouped.set(saleId, [...(grouped.get(saleId) ?? []), line]);
    });

  return [...grouped.entries()]
    .map(([saleId, lines]): SaleHistoryRecord => {
      const first = lines[0];
      const revenueEur = roundMoney(lines.reduce((sum, line) => sum + line.revenueEur, 0));
      const marginEur = roundMoney(lines.reduce((sum, line) => sum + line.marginEur, 0));
      const exchangeTopUpEur = roundMoney(lines.reduce((sum, line) => sum + (line.exchange?.topUpEur ?? 0), 0));
      const paymentSnapshots = [...new Set(lines.map((line) => line.paymentSnapshot).filter(Boolean))];

      return {
        id: saleId,
        saleId,
        sellerId: first.sellerId,
        seller: first.seller,
        store: first.store,
        status: first.status,
        quantity: lines.reduce((sum, line) => sum + line.quantity, 0),
        revenueEur,
        marginEur,
        paymentSnapshot: paymentSnapshots.join(" + "),
        ticketTotalSnapshot: formatEur(revenueEur + exchangeTopUpEur),
        dayOffset: first.dayOffset,
        time: first.time,
        lines,
      };
    })
    .sort((left, right) => left.dayOffset - right.dayOffset || right.time.localeCompare(left.time));
}

export function paginateSaleHistory(items: SaleHistoryRecord[], requestedPage: number, pageSize = 10) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), pageCount);
  return { page, pageCount, items: items.slice((page - 1) * pageSize, page * pageSize) };
}
