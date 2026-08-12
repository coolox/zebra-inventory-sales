import { describe, expect, it } from "vitest";
import { formatActivityAmount } from "./format-activity";

describe("formatActivityAmount", () => {
  it("preserves original currency and converted label", () => {
    expect(formatActivityAmount({ id: 1, type: "sale", title: "x", meta: "x", amount: 10, currency: "USD", converted: true }, (amount, currency) => `${amount} ${currency}`)).toBe("+≈10 USD");
  });
});
