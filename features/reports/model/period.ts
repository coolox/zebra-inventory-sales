import {
  businessAddDays,
  businessCalendarDay,
  businessDate,
  businessDateFromParts,
  businessTimezone,
  businessWeekday,
} from "@/lib/business-date";

export { businessTimezone } from "@/lib/business-date";

export type ReportPeriodPreset = "today" | "week" | "month" | "year" | "custom";
export type ReportPeriod = { preset: Exclude<ReportPeriodPreset, "custom">; from: string; to: string } | { preset: "custom"; from: string; to: string };
export type ReportPeriodQuery = { from: string; to: string };

export function reportPeriod(preset: ReportPeriodPreset, now = new Date(), timezone = businessTimezone): ReportPeriod {
  const today = businessCalendarDay(now, timezone);
  const to = businessDate(now, timezone);
  if (preset === "today") return { preset, from: to, to };
  if (preset === "week") return { preset, from: businessDateFromParts(businessAddDays(today, -((businessWeekday(today) - 3 + 7) % 7))), to };
  if (preset === "month") return { preset, from: businessDateFromParts({ ...today, day: 1 }), to };
  if (preset === "year") return { preset, from: businessDateFromParts({ year: today.year, month: 1, day: 1 }), to };
  return { preset, from: to, to };
}

function validIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

/** Validates the inclusive date-only contract used by every reporting query. */
export function toReportPeriodQuery(period: ReportPeriod): ReportPeriodQuery {
  if (!validIsoDate(period.from) || !validIsoDate(period.to)) throw new Error("Report dates must be valid YYYY-MM-DD values.");
  if (period.from > period.to) throw new Error("Report start date must not be after its end date.");
  return { from: period.from, to: period.to };
}
