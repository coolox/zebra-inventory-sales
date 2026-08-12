import { describe, expect, it } from "vitest";
import { toInventoryMovements } from "./inventory";

describe("inventory contract", () => {
  it("returns detached movement history with variant identity and audit actor", () => {
    const source = [{ id: "movement-1", variantId: "variant-1", quantity: -1, occurredAt: "2026-08-12T10:00:00Z", actorName: "Owner", source: "adjustment" as const, reason: "Count", receiptLineId: null }];
    const result = toInventoryMovements(source);
    result[0].actorName = "Changed";
    expect(source[0].actorName).toBe("Owner");
  });
});
