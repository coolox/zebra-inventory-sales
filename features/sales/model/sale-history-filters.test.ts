import { describe, expect, it } from "vitest";
import { filterSaleHistory, readSaleHistoryFilters, wednesdayWeekStart } from "./sale-history-filters";

const records = [
  { id: "a", sellerId: "one", status: "confirmed", dayOffset: 0 },
  { id: "b", sellerId: "two", status: "cancelled", dayOffset: 1 },
  { id: "c", sellerId: "one", status: "confirmed", dayOffset: 7 },
] as never[];

describe("sale history filters", () => {
  it("starts the business week on Wednesday and ends it on Tuesday", () => {
    const tuesday = new Date(2026, 7, 11, 12);
    const start = wednesdayWeekStart(tuesday);
    expect([start.getFullYear(), start.getMonth(), start.getDate()]).toEqual([2026, 7, 5]);
    expect(filterSaleHistory(records, { sellerId: "all", status: "all", period: "week" }, tuesday).map((item) => item.id)).toEqual(["a", "b"]);
  });
  it("combines seller and status and never accepts a seller query outside its scope", () => {
    expect(filterSaleHistory(records, { sellerId: "one", status: "confirmed", period: "all" }).map((item) => item.id)).toEqual(["a", "c"]);
    expect(readSaleHistoryFilters("?saleSeller=two&saleStatus=cancelled", "one")).toMatchObject({ sellerId: "one", status: "cancelled" });
  });
});
