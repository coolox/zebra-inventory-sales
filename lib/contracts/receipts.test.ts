import { describe, expect, it } from "vitest";
import { toConfirmReceiptCommand } from "./receipts";

describe("receipt contract", () => {
  it("maps quantity, native currency and idempotency explicitly", () => {
    const command = toConfirmReceiptCommand("store-1", [{ code: "ZB-1", name: "Jacket", brand: "Zebra", category: "Outerwear", gender: "women", color: "Black", size: "M", cost: 100, currency: "USD", stock: 2, supplier: "Supplier", store: "clothing" }], "key-1");
    expect(command).toMatchObject({ storeId: "store-1", idempotencyKey: "key-1", lines: [{ quantity: 2, unitCost: 100, currency: "USD" }] });
  });
});
