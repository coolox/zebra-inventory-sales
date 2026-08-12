import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/types";
import { productMatchesCatalogSearch, resolveProductLookup } from "./catalog-search";

const variants: Product[] = [
  { id: "black-l", code: "TR-07", barcode: "869000700001", name: "Structured Jacket", brand: "Zebra", category: "Jackets", gender: "women", color: "Black", size: "L", cost: 120, currency: "EUR", stock: 2, supplier: "SUSI", store: "clothing", updated: "Today" },
  { id: "ivory-m", code: "TR-07", barcode: "869000700001", name: "Structured Jacket", brand: "Zebra", category: "Jackets", gender: "women", color: "Ivory", size: "M", cost: 120, currency: "EUR", stock: 1, supplier: "SUSI", store: "clothing", updated: "Today" },
  { id: "single", code: "KM-11", variantBarcode: "869000110011", name: "Silk Dress", brand: "Zebra", category: "Dresses", gender: "women", color: "Black", size: "S", cost: 90, currency: "EUR", stock: 1, supplier: "PINO", store: "clothing", updated: "Today" },
];

describe("catalog barcode search", () => {
  it("finds a model with either its code or its barcode", () => {
    expect(resolveProductLookup(variants, "tr-07").map((product) => product.id)).toEqual(["black-l", "ivory-m"]);
    expect(resolveProductLookup(variants, "869000700001").map((product) => product.id)).toEqual(["black-l", "ivory-m"]);
  });

  it("matches barcodes in catalog filtering and keeps a scanned variant specific", () => {
    expect(variants.filter((product) => productMatchesCatalogSearch(product, "869000700001")).map((product) => product.id)).toEqual(["black-l", "ivory-m"]);
    expect(resolveProductLookup(variants, "869000110011").map((product) => product.id)).toEqual(["single"]);
  });
});
