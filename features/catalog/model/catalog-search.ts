import type { Product } from "@/lib/types";

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

function includes(product: Product, needle: string) {
  return [
    product.code,
    product.barcode,
    product.variantBarcode,
    product.name,
    product.brand,
    product.size,
    product.color,
    product.supplier,
  ].some((value) => value?.toLocaleLowerCase().includes(needle));
}

/** Matches catalog text, model barcodes and optional per-variant barcodes. */
export function productMatchesCatalogSearch(product: Product, query: string) {
  const needle = normalized(query);
  return !needle || includes(product, needle);
}

/**
 * Resolves a sale/receipt lookup without changing the color → size picker.
 * A model barcode returns all its variants; a variant barcode returns just the
 * scanned variant. Model codes retain their existing behaviour.
 */
export function resolveProductLookup(products: Product[], query: string) {
  const needle = normalized(query);
  if (!needle) return [];

  const codeMatches = products.filter((product) => normalized(product.code) === needle);
  if (codeMatches.length) return codeMatches;

  const modelBarcodeMatches = products.filter((product) => product.barcode && normalized(product.barcode) === needle);
  if (modelBarcodeMatches.length) {
    const modelCodes = new Set(modelBarcodeMatches.map((product) => normalized(product.code)));
    return products.filter((product) => modelCodes.has(normalized(product.code)));
  }

  return products.filter((product) => product.variantBarcode && normalized(product.variantBarcode) === needle);
}
