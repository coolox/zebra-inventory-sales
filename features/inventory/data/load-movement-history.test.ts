import { describe, expect, it } from "vitest";
import { mapMovementHistory, movementSource } from "./load-movement-history";

describe("movementSource", () => {
  it("normalizes all current inventory movement families", () => {
    expect(movementSource("receipt")).toBe("receipt");
    expect(movementSource("sale")).toBe("sale");
    expect(movementSource("exchange_in")).toBe("exchange");
    expect(movementSource("transfer_out")).toBe("transfer");
    expect(movementSource("write_off")).toBe("write_off");
    expect(movementSource("future_type")).toBe("unknown");
  });
});

describe("mapMovementHistory", () => {
  it("preserves chronology fields, source and an explicit system actor", () => {
    const items = mapMovementHistory([
      { id: "m-1", variant_id: "v-1", movement_type: "receipt", quantity: 3, occurred_at: "2026-08-11T10:00:00.000Z", actor_id: "a-1", receipt_line_id: "r-1", reason: "Manual receipt" },
      { id: "m-2", variant_id: "v-1", movement_type: "adjustment", quantity: -1, occurred_at: "2026-08-11T11:00:00.000Z", actor_id: null, receipt_line_id: null, reason: null },
    ], [{ id: "a-1", full_name: "Deniz Arslan" }]);

    expect(items).toEqual([
      expect.objectContaining({ id: "m-1", quantity: 3, source: "receipt", actorName: "Deniz Arslan", receiptLineId: "r-1" }),
      expect.objectContaining({ id: "m-2", quantity: -1, source: "adjustment", actorName: "System", reason: null }),
    ]);
  });
});
