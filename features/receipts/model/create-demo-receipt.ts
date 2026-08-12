import type { Product } from "@/lib/types";
import type { DemoReceiptResult, ReceiptDraft } from "./types";

const receiptCurrencies = new Set(["EUR", "USD", "TRY", "RUB", "GBP"]);

function sameVariant(product: Product, line: ReceiptDraft) {
  return product.store === "clothing"
    && product.code.toLowerCase() === line.code.toLowerCase()
    && product.color.toLowerCase() === line.color.toLowerCase()
    && product.size.toLowerCase() === line.size.toLowerCase();
}

export function createDemoReceipt(lines: ReceiptDraft[], products: Product[], stamp = Date.now()): DemoReceiptResult {
  if (!lines.length) throw new Error("Add at least one receipt line.");

  lines.forEach((line) => {
    if (!Number.isInteger(line.stock) || line.stock <= 0) {
      throw new Error("Receipt quantity must be a positive whole number.");
    }
    if (!Number.isFinite(line.cost) || line.cost <= 0) {
      throw new Error("Receipt cost must be a positive number.");
    }
    if (!receiptCurrencies.has(line.currency)) {
      throw new Error("Receipt currency is not supported.");
    }
  });

  const nextProducts = [...products];
  lines.forEach((line, index) => {
    const existingIndex = nextProducts.findIndex((product) => sameVariant(product, line));
    if (existingIndex >= 0) {
      nextProducts[existingIndex] = {
        ...nextProducts[existingIndex],
        ...line,
        stock: nextProducts[existingIndex].stock + line.stock,
        updated: "Just now",
      };
      return;
    }

    nextProducts.unshift({ ...line, id: stamp + index, updated: "Just now", store: "clothing" });
  });

  const totalItems = lines.reduce((sum, line) => sum + line.stock, 0);
  const suppliers = [...new Set(lines.map((line) => line.supplier))];

  return {
    products: nextProducts,
    totalItems,
    activity: {
      id: stamp,
      type: "receipt",
      title: `Receipt from ${suppliers[0]}`,
      meta: `${totalItems} items · Zebra Boutique · just now`,
    },
  };
}
