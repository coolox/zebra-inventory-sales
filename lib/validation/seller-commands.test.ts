import { describe, expect, it } from "vitest";
import { parseSellerInvite, parseSellerStatus } from "./seller-commands";

const storeId = "11111111-1111-4111-8111-111111111111";
const sellerId = "22222222-2222-4222-8222-222222222222";
const idempotencyKey = "33333333-3333-4333-8333-333333333333";

describe("seller command validation", () => {
  it("accepts and normalizes a valid invite without retaining unknown fields", () => {
    expect(parseSellerInvite({ storeId, idempotencyKey, fullName: "  Deniz Yılmaz ", email: " DENIZ@ZEBRA.TEST ", phone: "+90 555 000 00 00", ignored: "value" })).toEqual({ ok: true, value: { storeId, idempotencyKey, fullName: "Deniz Yılmaz", email: "deniz@zebra.test", phone: "+90 555 000 00 00" } });
  });

  it("rejects malformed objects, identifiers and unsafe field lengths", () => {
    expect(parseSellerInvite(null)).toEqual({ ok: false });
    expect(parseSellerInvite([])).toEqual({ ok: false });
    expect(parseSellerInvite({ storeId: "store", idempotencyKey, fullName: "Deniz", email: "deniz@zebra.test", phone: "+90" })).toEqual({ ok: false });
    expect(parseSellerInvite({ storeId, idempotencyKey, fullName: "D".repeat(121), email: "deniz@zebra.test", phone: "+90" })).toEqual({ ok: false });
  });

  it("allows only explicit seller membership transitions", () => {
    expect(parseSellerStatus({ storeId, sellerId, status: "blocked" })).toEqual({ ok: true, value: { storeId, sellerId, status: "blocked" } });
    expect(parseSellerStatus({ storeId, sellerId, status: "invited" })).toEqual({ ok: false });
  });
});
