import type { SaleHistoryRecord } from "./sale-history";
import { businessAddDays, businessCalendarDay, businessWeekday } from "@/lib/business-date";

export type SaleHistoryPeriod = "all" | "today" | "week";
export type SaleHistoryStatus = "all" | "confirmed" | "cancelled";
export type SaleHistoryFilters = { sellerId: string; status: SaleHistoryStatus; period: SaleHistoryPeriod };

export function wednesdayWeekStart(date: Date) {
  const today = businessCalendarDay(date);
  const start = businessAddDays(today, -((businessWeekday(today) - 3 + 7) % 7));
  return new Date(Date.UTC(start.year, start.month - 1, start.day));
}

export function filterSaleHistory(records: SaleHistoryRecord[], filters: SaleHistoryFilters, now = new Date()) {
  const today = businessCalendarDay(now);
  const daysSinceWednesday = (businessWeekday(today) - 3 + 7) % 7;
  return records.filter((record) => {
    if (filters.sellerId !== "all" && String(record.sellerId) !== filters.sellerId) return false;
    if (filters.status !== "all" && record.status !== filters.status) return false;
    if (filters.period === "all") return true;
    return filters.period === "today" ? record.dayOffset === 0 : record.dayOffset >= 0 && record.dayOffset <= daysSinceWednesday;
  });
}

export function readSaleHistoryFilters(search: string, sellerScope?: string): SaleHistoryFilters {
  const params = new URLSearchParams(search);
  const status = params.get("saleStatus"); const period = params.get("salePeriod"); const seller = params.get("saleSeller");
  return { sellerId: sellerScope ?? seller ?? "all", status: status === "confirmed" || status === "cancelled" ? status : "all", period: period === "today" || period === "week" ? period : "all" };
}

export function writeSaleHistoryFilters(filters: SaleHistoryFilters) {
  const params = new URLSearchParams(window.location.search);
  (["saleSeller", "saleStatus", "salePeriod"] as const).forEach((key) => params.delete(key));
  if (filters.sellerId !== "all") params.set("saleSeller", filters.sellerId);
  if (filters.status !== "all") params.set("saleStatus", filters.status);
  if (filters.period !== "all") params.set("salePeriod", filters.period);
  const query = params.toString(); window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
}
