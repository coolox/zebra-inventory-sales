import type { SaleHistoryRecord } from "./sale-history";

export type SaleHistoryPeriod = "all" | "today" | "week";
export type SaleHistoryStatus = "all" | "confirmed" | "cancelled";
export type SaleHistoryFilters = { sellerId: string; status: SaleHistoryStatus; period: SaleHistoryPeriod };

export function wednesdayWeekStart(date: Date) {
  const result = new Date(date); result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() - 3 + 7) % 7));
  return result;
}

export function filterSaleHistory(records: SaleHistoryRecord[], filters: SaleHistoryFilters, now = new Date()) {
  const start = wednesdayWeekStart(now);
  return records.filter((record) => {
    if (filters.sellerId !== "all" && String(record.sellerId) !== filters.sellerId) return false;
    if (filters.status !== "all" && record.status !== filters.status) return false;
    if (filters.period === "all") return true;
    const date = new Date(now); date.setDate(date.getDate() - record.dayOffset); date.setHours(0, 0, 0, 0);
    return filters.period === "today" ? record.dayOffset === 0 : date >= start;
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
