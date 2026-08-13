import type { Locale } from "@/lib/i18n";
import type { Activity, Product, Sale, Seller } from "@/lib/types";
import { calculatePaymentsTotalEur, demoPaymentRates, type PaymentRateMap } from "./payments";
import type { SaleDraftLine, SalePaymentDraft, SalePricingMode } from "./types";

const eurPerUnit: Record<Product["currency"], number> = {
  EUR: 1,
  USD: 0.93,
  TRY: 0.028,
  RUB: 0.011,
  GBP: 1.17,
};

type DemoSaleResult = {
  sales: Sale[];
  products: Product[];
  activity: Activity;
  totalItems: number;
  totalEur: number;
};

export function createDemoSale(
  lines: SaleDraftLine[],
  products: Product[],
  seller: Seller,
  locale: Locale = "en",
  now = new Date(),
  pricingMode: SalePricingMode = "per_item",
  payments: SalePaymentDraft[] = [],
  paymentRates: PaymentRateMap = demoPaymentRates,
): DemoSaleResult {
  const errors = locale === "tr" ? {
    empty: "Satışa en az bir ürün ekleyin.",
    unavailable: "Seçilen ürün artık mevcut değil.",
    stock: "Bu beden az önce tükendi. Kataloğu yenileyip tekrar deneyin.",
  } : {
    empty: "Add at least one item to the sale.",
    unavailable: "A selected product is no longer available.",
    stock: "This size has just sold out. Refresh the catalog and try again.",
  };
  if (!lines.length) throw new Error(errors.empty);

  const requestedByProduct = new Map<Product["id"], number>();
  lines.forEach((line) => {
    requestedByProduct.set(line.productId, (requestedByProduct.get(line.productId) ?? 0) + line.quantity);
  });

  requestedByProduct.forEach((quantity, productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) throw new Error(errors.unavailable);
    if (quantity > product.stock) throw new Error(errors.stock);
  });

  const totalCostEur = lines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId)!;
    return sum + product.cost * line.quantity * eurPerUnit[product.currency];
  }, 0);
  const totalRevenueEur = pricingMode === "sale_total"
    ? calculatePaymentsTotalEur(payments, paymentRates)
    : lines.reduce((sum, line) => sum + ((line.price ?? 0) * line.quantity * (line.currency ? eurPerUnit[line.currency] : 0)), 0);
  if (totalRevenueEur === null || totalRevenueEur <= 0) throw new Error(errors.empty);

  let allocatedRevenue = 0;
  const stamp = now.getTime();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const sales = lines.map((line, index): Sale => {
    const product = products.find((item) => item.id === line.productId)!;
    const costEur = product.cost * line.quantity * eurPerUnit[product.currency];
    const isLastLine = index === lines.length - 1;
    const revenueEur = pricingMode === "sale_total"
      ? isLastLine
        ? totalRevenueEur - allocatedRevenue
        : Math.round((totalCostEur > 0 ? totalRevenueEur * costEur / totalCostEur : totalRevenueEur / lines.length) * 100) / 100
      : (line.price ?? 0) * line.quantity * (line.currency ? eurPerUnit[line.currency] : 0);
    allocatedRevenue += revenueEur;

    return {
      // A shared prefix gives history and cancellation one stable sale identity.
      id: `${stamp}:${index}`,
      productId: product.id,
      sellerId: seller.id,
      seller: seller.name,
      store: "clothing",
      product: product.name,
      code: product.code,
      size: product.size,
      quantity: line.quantity,
      revenueEur: Math.round(revenueEur),
      marginEur: Math.round(revenueEur - costEur),
      revenueIsAllocated: pricingMode === "sale_total",
      paymentSnapshot: payments.length ? payments.map((payment) => `${payment.amount} ${payment.currency}`).join(" + ") : `${line.price ?? 0} ${line.currency ?? "EUR"}`,
      status: "confirmed",
      dayOffset: 0,
      time,
    };
  });
  const updatedProducts = products.map((product) => {
    const sold = requestedByProduct.get(product.id) ?? 0;
    return sold ? { ...product, stock: product.stock - sold, updated: "Just now" } : product;
  });
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalEur = totalRevenueEur;

  return {
    sales,
    products: updatedProducts,
    totalItems,
    totalEur,
    activity: {
      id: stamp,
      type: "sale",
      title: `Sale · ${totalItems} ${totalItems === 1 ? "item" : "items"}`,
      meta: `${seller.name} · Zebra Boutique · just now`,
      amount: totalEur,
    },
  };
}
