import { describe, expect, it } from "vitest";
import { reportPeriod, toReportPeriodQuery } from "./period";

describe("report periods", () => {
  it("uses Istanbul calendar days, including the Wednesday–Tuesday business week boundary", () => {
    const tuesdayLateUtc = new Date("2026-08-11T20:30:00Z"); // 23:30 Tuesday in Istanbul
    expect(reportPeriod("week", tuesdayLateUtc)).toEqual({ preset: "week", from: "2026-08-05", to: "2026-08-11" });
    const wednesdayUtc = new Date("2026-08-11T21:30:00Z"); // 00:30 Wednesday in Istanbul
    expect(reportPeriod("week", wednesdayUtc)).toEqual({ preset: "week", from: "2026-08-12", to: "2026-08-12" });
  });

  it("derives today, month and year without depending on host timezone or DST", () => {
    const dstFixture = new Date("2026-03-29T21:30:00Z"); // 00:30 Istanbul, after Europe DST change elsewhere
    expect(reportPeriod("today", dstFixture)).toEqual({ preset: "today", from: "2026-03-30", to: "2026-03-30" });
    expect(reportPeriod("month", dstFixture)).toEqual({ preset: "month", from: "2026-03-01", to: "2026-03-30" });
    expect(reportPeriod("year", dstFixture)).toEqual({ preset: "year", from: "2026-01-01", to: "2026-03-30" });
  });

  it("accepts only ordered, real custom calendar dates", () => {
    expect(toReportPeriodQuery({ preset: "custom", from: "2026-02-01", to: "2026-02-28" })).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(() => toReportPeriodQuery({ preset: "custom", from: "2026-02-29", to: "2026-03-01" })).toThrow("valid");
    expect(() => toReportPeriodQuery({ preset: "custom", from: "2026-03-02", to: "2026-03-01" })).toThrow("start");
  });
});
