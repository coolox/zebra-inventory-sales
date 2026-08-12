import { productMatchesCatalogSearch } from "@/features/catalog/model/catalog-search";
import { sortProductsByAvailability } from "@/features/catalog/model/sort-products-by-availability";
import type { Product, StoreId } from "@/lib/types";

export function filterInventoryProducts(products: Product[], store: StoreId, search: string) {
  const needle = search.trim().toLowerCase();
  return sortProductsByAvailability(products.filter((product) => product.isActive !== false && product.store === store && productMatchesCatalogSearch(product, needle)));
}

export function paginateInventoryProducts(products: Product[], requestedPage: number, pageSize = 10) {
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return { page, pageCount, items: products.slice((page - 1) * pageSize, page * pageSize) };
}
