import { describe, expect, it } from "vitest";
import { validateSellerInvite, validateSellerStatus } from "./types";

describe("seller invite command", () => {
  it("requires complete contact data and an idempotency key", () => {
    expect(validateSellerInvite({ email: "not-an-email" })).toMatch(/Store/);
    expect(validateSellerInvite({ storeId: "s", fullName: "Deniz", phone: "+90", idempotencyKey: "key", email: "deniz@zebra.store" })).toBeNull();
  });
});

describe("seller membership status command", () => {
  it("accepts only store-scoped active and blocked transitions", () => {
    expect(validateSellerStatus({ storeId: "store", sellerId: "seller", status: "blocked" })).toBeNull();
    expect(validateSellerStatus({ storeId: "store", sellerId: "seller", status: "active" })).toBeNull();
    expect(validateSellerStatus({ storeId: "store", sellerId: "seller" })).toMatch(/status/i);
    expect(validateSellerStatus({ storeId: "store", sellerId: "seller", status: "invited" as never })).toMatch(/active or blocked/i);
  });
});
