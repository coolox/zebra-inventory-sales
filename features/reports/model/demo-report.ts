import type { Product, Sale, SaleExchange } from "@/lib/types";
import type { ReportingBreakdown, ReportingDimension } from "../data/load-breakdowns";
import type { InventoryReportRow } from "../data/load-inventory-report";
import type { ReportingMetrics } from "../data/load-metrics";
import type { ReportPeriod } from "./period";

const saleId = (value: Sale["id"]) => String(value).split(":")[0];
const isoDaysAgo = (amount: number, now: Date) => { const date = new Date(now); date.setDate(date.getDate() - amount); return date.toISOString().slice(0, 10); };
const inPeriod = (dayOffset: number, period: ReportPeriod, now: Date) => { const day = isoDaysAgo(dayOffset, now); return day >= period.from && day <= period.to; };
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function demoReportData({ sales, products, exchanges, period, dimension, now = new Date() }: { sales: Sale[]; products: Product[]; exchanges: SaleExchange[]; period: ReportPeriod; dimension: ReportingDimension; now?: Date }): { metrics: ReportingMetrics; breakdowns: ReportingBreakdown[]; inventory: InventoryReportRow[] } {
  const scopedSales = sales.filter((sale) => sale.store === "clothing" && sale.status !== "cancelled" && inPeriod(sale.dayOffset, period, now));
  const confirmedSaleIds = new Set(sales.filter((sale) => sale.store === "clothing" && sale.status !== "cancelled").map((sale) => saleId(sale.id)));
  const scopedExchanges = exchanges.filter((exchange) => exchange.store === "clothing" && confirmedSaleIds.has(exchange.saleId) && inPeriod(exchange.dayOffset, period, now));
  const exchangeTopUps = scopedExchanges.reduce((sum, exchange) => sum + exchange.topUpEur, 0);
  const cost = scopedSales.reduce((sum, sale) => sum + sale.revenueEur - sale.marginEur, 0) + scopedExchanges.reduce((sum, exchange) => sum + exchange.topUpEur - exchange.marginDeltaEur, 0);
  const revenue = scopedSales.reduce((sum, sale) => sum + sale.revenueEur, 0) + exchangeTopUps;
  const ticketCount = new Set(scopedSales.map((sale) => saleId(sale.id))).size;
  const metrics = { revenueEur: round(revenue), costEur: round(cost), marginEur: round(revenue - cost), saleCount: ticketCount, units: scopedSales.reduce((sum, sale) => sum + sale.quantity, 0), averageTicketEur: ticketCount ? round(revenue / ticketCount) : 0 };
  const keyFor = (sale: Sale) => {
    const product = products.find((item) => item.id === sale.productId);
    if (dimension === "seller") return [String(sale.sellerId), sale.seller];
    if (dimension === "supplier") return [product?.supplier ?? "unassigned", product?.supplier ?? "Unassigned"];
    if (dimension === "brand") return [product?.brand ?? "unknown", product?.brand ?? "Unknown"];
    if (dimension === "model") return [String(sale.productId), sale.product];
    return [product?.category ?? "unknown", product?.category ?? "Unknown"];
  };
  const grouped = new Map<string, ReportingBreakdown>();
  scopedSales.forEach((sale) => { const [key, label] = keyFor(sale); const current = grouped.get(key) ?? { key, label, revenueEur: 0, costEur: 0, marginEur: 0, units: 0 }; const saleCost = sale.revenueEur - sale.marginEur; current.revenueEur += sale.revenueEur; current.costEur += saleCost; current.marginEur += sale.marginEur; current.units += sale.quantity; grouped.set(key, current); });
  scopedExchanges.forEach((exchange) => { const replacement = products.find((item) => item.id === exchange.replacementProductId); const [key, label] = dimension === "seller" ? [String(exchange.sellerId), exchange.seller] : dimension === "supplier" ? [replacement?.supplier ?? "unassigned", replacement?.supplier ?? "Unassigned"] : dimension === "brand" ? [replacement?.brand ?? "unknown", replacement?.brand ?? "Unknown"] : dimension === "model" ? [String(exchange.replacementProductId), exchange.replacementProduct] : [replacement?.category ?? "unknown", replacement?.category ?? "Unknown"]; const current = grouped.get(key) ?? { key, label, revenueEur: 0, costEur: 0, marginEur: 0, units: 0 }; current.revenueEur += exchange.topUpEur; current.costEur += exchange.topUpEur - exchange.marginDeltaEur; current.marginEur += exchange.marginDeltaEur; grouped.set(key, current); });
  const breakdowns = [...grouped.values()].map((row) => ({ ...row, revenueEur: round(row.revenueEur), costEur: round(row.costEur), marginEur: round(row.marginEur) })).sort((a, b) => b.revenueEur - a.revenueEur || a.label.localeCompare(b.label));
  const inventory = products.filter((product) => product.store === "clothing").map((product) => { const exchangedOut = scopedExchanges.filter((exchange) => exchange.sourceProductId === product.id).reduce((sum, exchange) => sum + exchange.quantity, 0); const exchangedIn = scopedExchanges.filter((exchange) => exchange.replacementProductId === product.id).reduce((sum, exchange) => sum + exchange.quantity, 0); const soldUnits = scopedSales.filter((sale) => sale.productId === product.id).reduce((sum, sale) => sum + sale.quantity, 0) - exchangedOut + exchangedIn; const threshold = product.lowStockThreshold ?? 2; return { modelId: product.modelId ?? String(product.id), modelCode: product.code, modelName: product.name, variantId: product.variantId ?? String(product.id), color: product.color, size: product.size, balance: product.stock, soldUnits, sellThrough: soldUnits + Math.max(product.stock, 0) ? soldUnits / (soldUnits + Math.max(product.stock, 0)) : 0, turnover: 0, lowStockThreshold: threshold, isLowStock: product.stock <= threshold }; });
  return { metrics, breakdowns, inventory };
}
