import { describe, expect, it } from "vitest";
import { mapAuditLog } from "./load-audit-log";

describe("mapAuditLog", () => {
  it("normalizes categories and exposes actor name without profile contact data", () => {
    const [item] = mapAuditLog([{ id: "1", action: "seller.deactivated", entity_type: "store_membership", entity_id: "m", actor_id: "a", details: {}, created_at: "2026-08-12T00:00:00Z" }], [{ id: "a", full_name: "Owner" }]);
    expect(item).toMatchObject({ category: "seller", actorName: "Owner", entityId: "m" });
    expect(item).not.toHaveProperty("email");
  });
});
