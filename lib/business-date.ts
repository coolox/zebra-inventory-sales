/**
 * Zebra Boutique's operational calendar. Browser/device local time must never
 * decide which sales belong to the Istanbul business day.
 */
export const businessTimezone = "Europe/Istanbul";

export type BusinessCalendarDay = { year: number; month: number; day: number };

export function businessCalendarDay(date: Date, timezone = businessTimezone): BusinessCalendarDay {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

export function businessDateFromParts(day: BusinessCalendarDay) {
  return `${day.year}-${String(day.month).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
}

export function businessDate(date: Date, timezone = businessTimezone) {
  return businessDateFromParts(businessCalendarDay(date, timezone));
}

export function businessAddDays(day: BusinessCalendarDay, amount: number): BusinessCalendarDay {
  const value = new Date(Date.UTC(day.year, day.month - 1, day.day + amount));
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
}

export function businessWeekday(day: BusinessCalendarDay) {
  return new Date(Date.UTC(day.year, day.month - 1, day.day)).getUTCDay();
}

function calendarOrdinal(day: BusinessCalendarDay) {
  return Math.floor(Date.UTC(day.year, day.month - 1, day.day) / 86_400_000);
}

/** Returns calendar-day difference, not elapsed 24-hour periods. */
export function businessDayOffset(value: Date | string, now = new Date(), timezone = businessTimezone) {
  const occurred = value instanceof Date ? value : new Date(value);
  return calendarOrdinal(businessCalendarDay(now, timezone)) - calendarOrdinal(businessCalendarDay(occurred, timezone));
}

export function businessDateDaysAgo(amount: number, now = new Date(), timezone = businessTimezone) {
  return businessDateFromParts(businessAddDays(businessCalendarDay(now, timezone), -amount));
}
