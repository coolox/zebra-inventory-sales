import { describe, expect, it } from "vitest";
import { toSessionDto } from "./auth";

describe("toSessionDto", () => {
  it("normalizes a server membership response without exposing storage field names", () => {
    const dto = toSessionDto({
      user: { id: "user-1", email: "owner@zebra.test" },
      profile: { locale: "tr", theme: "light" },
      memberships: [{ store_id: "store-1", role: "owner", status: "active", stores: { id: "store-1", code: "ZB", name: "Zebra Boutique", category: "clothing" } }],
    });

    expect(dto).toEqual({
      user: { id: "user-1", email: "owner@zebra.test", fullName: "owner@zebra.test" },
      profile: { locale: "tr", theme: "light" },
      memberships: [{ storeId: "store-1", role: "owner", status: "active", store: { id: "store-1", code: "ZB", name: "Zebra Boutique", category: "clothing" } }],
    });
  });
});
