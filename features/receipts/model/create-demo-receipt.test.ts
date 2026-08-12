import { describe, expect, it } from "vitest";
import { createDemoReceipt } from "./create-demo-receipt";
import type { ReceiptDraft } from "./types";

const existingProduct = {
  id: 10,
  code: "TR-07",
  name: "Structured Jacket",
  brand: "Balmain",
  category: "Jackets",
  gender: "women" as const,
  size: "M",
  color: "Black",
  cost: 120,
  currency: "EUR" as const,
  stock: 2,
  supplier: "SUSI",
  store: "clothing" as const,
  updated: "Yesterday",
};

const { id: _existingId, updated: _existingUpdated, ...receiptProduct } = existingProduct;
const receiptLine: ReceiptDraft = { ...receiptProduct, stock: 3 };

describe("createDemoReceipt", () => {
  it("merges an existing variant and preserves its id", () => {
    const result = createDemoReceipt([receiptLine], [existingProduct], 1000);

    expect(result.products).toEqual([{ ...existingProduct, ...receiptLine, stock: 5, updated: "Just now" }]);
    expect(result.totalItems).toBe(3);
    expect(result.activity).toMatchObject({ id: 1000, title: "Receipt from SUSI", meta: "3 items · Zebra Boutique · just now" });
  });

  it("creates new variants deterministically", () => {
    const newVariant: ReceiptDraft = { ...receiptLine, color: "Ivory", size: "S", stock: 2 };
    const result = createDemoReceipt([newVariant], [existingProduct], 1000);

    expect(result.products[0]).toMatchObject({ ...newVariant, id: 1000, updated: "Just now", store: "clothing" });
    expect(result.products).toHaveLength(2);
  });

  it("handles multiple size and color lines in one receipt", () => {
    const lines: ReceiptDraft[] = [
      receiptLine,
      { ...receiptLine, size: "L", stock: 2 },
      { ...receiptLine, color: "Ivory", size: "S", stock: 1 },
    ];

    const result = createDemoReceipt(lines, [existingProduct], 1000);

    expect(result.totalItems).toBe(6);
    expect(result.products).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "TR-07", color: "Black", size: "M", stock: 5 }),
      expect.objectContaining({ code: "TR-07", color: "Black", size: "L", stock: 2 }),
      expect.objectContaining({ code: "TR-07", color: "Ivory", size: "S", stock: 1 }),
    ]));
  });

  it("rejects a receipt with invalid quantity without mutating products", () => {
    const source = [existingProduct];

    expect(() => createDemoReceipt([{ ...receiptLine, stock: 0 }], source, 1000)).toThrow("Receipt quantity must be a positive whole number.");
    expect(source).toEqual([existingProduct]);
  });

  it.each([0, -1, Number.NaN])("rejects invalid cost %s", (cost) => {
    expect(() => createDemoReceipt([{ ...receiptLine, cost }], [existingProduct], 1000)).toThrow("Receipt cost must be a positive number.");
  });

  it("rejects an unsupported currency", () => {
    const invalidLine = { ...receiptLine, currency: "BTC" as ReceiptDraft["currency"] };

    expect(() => createDemoReceipt([invalidLine], [existingProduct], 1000)).toThrow("Receipt currency is not supported.");
  });
});
