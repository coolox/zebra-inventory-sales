import type { Activity } from "@/lib/types";

export function formatActivityAmount(item: Activity, formatMoney: (amount: number, currency?: string) => string) {
  if (item.amount === undefined) return null;
  return `+${item.converted ? "≈" : ""}${formatMoney(item.amount, item.currency)}`;
}
