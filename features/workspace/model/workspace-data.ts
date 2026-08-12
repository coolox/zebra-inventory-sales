import { initialActivity, initialProducts, initialSales, initialSellers } from "@/lib/mock-data";
import type { Activity, Product, Sale, Seller } from "@/lib/types";

export type WorkspaceData = {
  products: Product[];
  sales: Sale[];
  sellers: Seller[];
  activities: Activity[];
};

export function createInitialWorkspaceData(): WorkspaceData {
  // This is rendered before the client reads runtime configuration. Keep the
  // server and first browser tree identical; live data replaces it after the
  // authenticated session check in app/page.tsx.
  return {
    products: initialProducts.map((product) => ({ ...product, photos: product.photos ? [...product.photos] : undefined })),
    sales: initialSales.map((sale) => ({ ...sale })),
    sellers: initialSellers.map((seller) => ({ ...seller })),
    activities: initialActivity.map((activity) => ({ ...activity })),
  };
}
