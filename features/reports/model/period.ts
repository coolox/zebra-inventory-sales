export const businessTimezone = "Europe/Istanbul";

export type ReportPeriodPreset = "today" | "week" | "month" | "year" | "custom";
export type ReportPeriod = { preset: Exclude<ReportPeriodPreset, "custom">; from: string; to: string } | { preset: "custom"; from: string; to: string };
export type ReportPeriodQuery = { from: string; to: string };

type CalendarDay = { year: number; month: number; day: number };

function calendarDay(date: Date, timezone = businessTimezone): CalendarDay {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function dateValue(day: CalendarDay) {
  return `${day.year}-${String(day.month).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
}

function addDays(day: CalendarDay, amount: number): CalendarDay {
  const value = new Date(Date.UTC(day.year, day.month - 1, day.day + amount));
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
}

function weekday(day: CalendarDay) {
  return new Date(Date.UTC(day.year, day.month - 1, day.day)).getUTCDay();
}

export function reportPeriod(preset: ReportPeriodPreset, now = new Date(), timezone = businessTimezone): ReportPeriod {
  const today = calendarDay(now, timezone);
  const to = dateValue(today);
  if (preset === "today") return { preset, from: to, to };
  if (preset === "week") return { preset, from: dateValue(addDays(today, -((weekday(today) - 3 + 7) % 7))), to };
  if (preset === "month") return { preset, from: dateValue({ ...today, day: 1 }), to };
  if (preset === "year") return { preset, from: dateValue({ year: today.year, month: 1, day: 1 }), to };
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
