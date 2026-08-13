import type { Product, Sale, Seller } from "@/lib/types";

export function selectMetrics(sales: Sale[], products: Product[]) {
  const confirmed = sales.filter((sale) => sale.status !== "cancelled");
  return { revenue: confirmed.reduce((sum, sale) => sum + sale.revenueEur, 0), margin: confirmed.reduce((sum, sale) => sum + sale.marginEur, 0), units: products.reduce((sum, product) => sum + product.stock, 0), low: products.filter((product) => product.stock <= 2).length, count: confirmed.reduce((sum, sale) => sum + sale.quantity, 0) };
}

export function selectChartData(sales: Sale[], store: Product["store"], sellerId?: Sale["sellerId"]) {
  const labels = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Today"];
  return labels.map((label, index) => ({ label, value: sales.filter((sale) => sale.status !== "cancelled" && sale.dayOffset === 6 - index && sale.store === store && (!sellerId || sale.sellerId === sellerId)).reduce((sum, sale) => sum + sale.revenueEur, 0) }));
}

export function selectSellerRanking(sellers: Seller[], sales: Sale[], store: Product["store"], maxDays: number) {
  return sellers.filter((seller) => seller.store === store).map((seller) => {
    const sellerSales = sales.filter((sale) => sale.status !== "cancelled" && sale.sellerId === seller.id && sale.store === store && sale.dayOffset <= maxDays);
    return { ...seller, revenue: sellerSales.reduce((sum, sale) => sum + sale.revenueEur, 0), count: sellerSales.reduce((sum, sale) => sum + sale.quantity, 0) };
  }).sort((a, b) => b.revenue - a.revenue);
}
