import type { Product } from "@/lib/types";

export type CatalogVariantDto = Product;
export type CatalogCurrency = Product["currency"];

export type ArchiveProductModelCommand = {
  storeId: string;
  modelId: string;
  archived: boolean;
};

export function toCatalogVariants(products: CatalogVariantDto[]): CatalogVariantDto[] {
  return products.map((product) => ({ ...product, photos: product.photos ? [...product.photos] : undefined }));
}
