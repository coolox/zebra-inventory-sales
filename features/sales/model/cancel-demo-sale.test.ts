import { describe, expect, it } from "vitest";
import { cancelDemoSale } from "./cancel-demo-sale";

describe("cancelDemoSale", () => {
  it("reverses every line of one sale and restores its stock", () => {
    const sales = [
      { id: "sale-1:0", productId: "a", quantity: 1, status: "confirmed" },
      { id: "sale-1:1", productId: "b", quantity: 2, status: "confirmed" },
      { id: "sale-2:0", productId: "a", quantity: 1, status: "confirmed" },
    ] as never[];
    const products = [{ id: "a", stock: 3 }, { id: "b", stock: 5 }] as never[];
    const result = cancelDemoSale("sale-1", sales, products);
    expect(result.sales.map((sale) => sale.status)).toEqual(["cancelled", "cancelled", "confirmed"]);
    expect(result.products.map((product) => product.stock)).toEqual([4, 7]);
  });
});
