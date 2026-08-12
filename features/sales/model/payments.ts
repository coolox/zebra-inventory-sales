import type { SaleDraftLine, SaleCurrency, SalePaymentDraft } from "./types";
export { paymentToleranceEur } from "@/lib/contracts/sales";

export type PaymentRateMap = Record<SaleCurrency, number | null>;
export type PaymentValidationIssue = "empty" | "amount" | "rate" | "total";

export const demoPaymentRates: PaymentRateMap = {
  EUR: 1,
  USD: 0.93,
  TRY: 0.028,
  RUB: 0.011,
  GBP: 1.17,
};

import { paymentToleranceEur } from "@/lib/contracts/sales";

export type PaymentSummary = {
  totalEur: number | null;
  paidEur: number | null;
  remainingEur: number | null;
  issues: PaymentValidationIssue[];
  isValid: boolean;
};

function roundEur(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toEur(amount: number, currency: SaleCurrency, rates: PaymentRateMap) {
  const rate = rates[currency];
  return Number.isFinite(amount) && amount > 0 && rate && rate > 0 ? roundEur(amount * rate) : null;
}

export function calculateSaleTotalEur(lines: SaleDraftLine[], rates: PaymentRateMap) {
  if (!lines.length) return null;
  const totals = lines.map((line) => line.price === null || line.currency === null
    ? null
    : toEur(line.price * line.quantity, line.currency, rates));
  if (totals.some((total) => total === null)) return null;
  return roundEur(totals.reduce<number>((sum, total) => sum + (total ?? 0), 0));
}

export function calculatePaymentsTotalEur(payments: SalePaymentDraft[], rates: PaymentRateMap) {
  if (!payments.length) return null;
  const totals = payments.map((payment) => toEur(payment.amount, payment.currency, rates));
  if (totals.some((total) => total === null)) return null;
  return roundEur(totals.reduce<number>((sum, total) => sum + (total ?? 0), 0));
}

export function summarizePayments(payments: SalePaymentDraft[], totalEur: number | null, rates: PaymentRateMap): PaymentSummary {
  const issues: PaymentValidationIssue[] = [];
  if (!payments.length) issues.push("empty");

  const convertedPayments = payments.map((payment) => {
    if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
      issues.push("amount");
      return null;
    }
    const converted = toEur(payment.amount, payment.currency, rates);
    if (converted === null) issues.push("rate");
    return converted;
  });

  if (totalEur === null) issues.push("rate");
  const paidEur = convertedPayments.some((payment) => payment === null)
    ? null
    : roundEur(convertedPayments.reduce<number>((sum, payment) => sum + (payment ?? 0), 0));
  const remainingEur = totalEur === null || paidEur === null ? null : roundEur(totalEur - paidEur);
  if (remainingEur !== null && Math.abs(remainingEur) > paymentToleranceEur) issues.push("total");

  return {
    totalEur,
    paidEur,
    remainingEur,
    issues: [...new Set(issues)],
    isValid: !issues.length,
  };
}
