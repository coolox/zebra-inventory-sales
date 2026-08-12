import { describe, expect, it } from "vitest";
import { calculatePaymentsTotalEur, calculateSaleTotalEur, demoPaymentRates, summarizePayments } from "./payments";
import type { SaleDraftLine, SalePaymentDraft } from "./types";

const lines: SaleDraftLine[] = [
  { productId: "variant-1", quantity: 1, price: 100, currency: "EUR" },
  { productId: "variant-1", quantity: 1, price: 100, currency: "USD" },
];

describe("payment summaries", () => {
  it("calculates a mixed-currency sale and a balanced payment", () => {
    const total = calculateSaleTotalEur(lines, demoPaymentRates);
    const payments: SalePaymentDraft[] = [
      { id: "cash", method: "cash", amount: 100, currency: "EUR" },
      { id: "card", method: "card", amount: 100, currency: "USD" },
    ];

    expect(total).toBe(193);
    expect(summarizePayments(payments, total, demoPaymentRates)).toMatchObject({ paidEur: 193, remainingEur: 0, isValid: true });
  });

  it("rejects empty, invalid and mismatched payment drafts", () => {
    expect(summarizePayments([], 100, demoPaymentRates).issues).toContain("empty");
    expect(summarizePayments([{ id: "cash", method: "cash", amount: 0, currency: "EUR" }], 100, demoPaymentRates).issues).toContain("amount");
    expect(summarizePayments([{ id: "cash", method: "cash", amount: 99, currency: "EUR" }], 100, demoPaymentRates).issues).toContain("total");
    expect(summarizePayments([{ id: "usd", method: "cash", amount: 100, currency: "USD" }], 100, { ...demoPaymentRates, USD: null }).issues).toContain("rate");
  });

  it("derives a single EUR sale total from native-currency payment lines", () => {
    expect(calculatePaymentsTotalEur([
      { id: "cash", method: "cash", amount: 50, currency: "EUR" },
      { id: "card", method: "card", amount: 50, currency: "USD" },
    ], demoPaymentRates)).toBe(96.5);
  });
});
