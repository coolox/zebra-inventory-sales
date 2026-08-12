import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/types";
import { sortProductsByAvailability } from "./sort-products-by-availability";

const product = (id: string, stock: number): Product => ({
  id,
  code: id,
  name: id,
  brand: "Zebra",
  category: "Dresses",
  gender: "women",
  color: "Black",
  size: "M",
  cost: 10,
  currency: "EUR",
  stock,
  supplier: "PINO",
  store: "clothing",
  updated: "Today",
});

describe("sortProductsByAvailability", () => {
  it("places zero-stock products after available products without mutating the source order", () => {
    const source = [product("zero-a", 0), product("available-a", 2), product("zero-b", 0), product("available-b", 5)];

    expect(sortProductsByAvailability(source).map(({ id }) => id)).toEqual(["available-a", "available-b", "zero-a", "zero-b"]);
    expect(source.map(({ id }) => id)).toEqual(["zero-a", "available-a", "zero-b", "available-b"]);
  });
});
