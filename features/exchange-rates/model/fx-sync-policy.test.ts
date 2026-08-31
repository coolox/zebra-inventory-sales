import { describe, expect, it } from "vitest";
import { businessDaysBetween, canCarryForward, isFutureSourceDate } from "./fx-sync-policy";

describe("FX sync carry-forward policy", () => {
  it("counts only Istanbul work-week days between source and target dates", () => {
    expect(businessDaysBetween("2026-08-28", "2026-08-31")).toBe(1);
    expect(businessDaysBetween("2026-08-28", "2026-09-02")).toBe(3);
  });

  it("allows at most three business days and rejects a future source", () => {
    expect(canCarryForward("2026-08-28", "2026-09-02")).toBe(true);
    expect(canCarryForward("2026-08-28", "2026-09-03")).toBe(false);
    expect(isFutureSourceDate("2026-09-01", "2026-08-31")).toBe(true);
  });
});
