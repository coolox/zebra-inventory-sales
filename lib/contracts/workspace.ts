import type { Activity, Product, Sale, Seller } from "@/lib/types";

/** Transport-safe workspace payload: normalized UI models, never database rows. */
export type WorkspaceSnapshotDto = {
  products: Product[];
  sales: Sale[];
  sellers: Seller[];
  activities: Activity[];
};

export function toWorkspaceSnapshot(source: WorkspaceSnapshotDto): WorkspaceSnapshotDto {
  return {
    products: source.products.map((product) => ({ ...product, photos: product.photos ? [...product.photos] : undefined })),
    sales: source.sales.map((sale) => ({ ...sale })),
    sellers: source.sellers.map((seller) => ({ ...seller })),
    activities: source.activities.map((activity) => ({ ...activity })),
  };
}
