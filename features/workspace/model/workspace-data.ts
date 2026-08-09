import { initialActivity, initialProducts, initialSales, initialSellers } from "@/lib/mock-data";
import type { Activity, Product, Sale, Seller } from "@/lib/types";
import { isLiveMode } from "./app-mode";

export type WorkspaceData = {
  products: Product[];
  sales: Sale[];
  sellers: Seller[];
  activities: Activity[];
};

export function createInitialWorkspaceData(): WorkspaceData {
  if (isLiveMode) {
    return { products: [], sales: [], sellers: [], activities: [] };
  }

  return {
    products: [...initialProducts],
    sales: [...initialSales],
    sellers: [...initialSellers],
    activities: [...initialActivity],
  };
}
