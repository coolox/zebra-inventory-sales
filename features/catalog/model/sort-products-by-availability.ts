import type { Product } from "@/lib/types";

export function sortProductsByAvailability(products: Product[]) {
  return [...products].sort((left, right) => Number(left.stock <= 0) - Number(right.stock <= 0));
}
