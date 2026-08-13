import type { Product, Sale } from "@/lib/types";

const idPrefix = (id: Sale["id"]) => String(id).split(":")[0];

/** Mirrors the cancellation RPC in demo mode: all lines in a sale are reversed atomically. */
export function cancelDemoSale(saleId: string, sales: Sale[], products: Product[]) {
  const lines = sales.filter((sale) => idPrefix(sale.id) === saleId && sale.status !== "cancelled");
  if (!lines.length) throw new Error("This sale is already cancelled or unavailable.");

  const quantities = new Map<Product["id"], number>();
  lines.forEach((sale) => quantities.set(sale.productId, (quantities.get(sale.productId) ?? 0) + sale.quantity));
  return {
    sales: sales.map((sale) => idPrefix(sale.id) === saleId ? { ...sale, status: "cancelled" as const } : sale),
    products: products.map((product) => {
      const quantity = quantities.get(product.id) ?? 0;
      return quantity ? { ...product, stock: product.stock + quantity, updated: "Just now" } : product;
    }),
  };
}
