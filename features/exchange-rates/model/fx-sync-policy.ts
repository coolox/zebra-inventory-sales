const MS_PER_DAY = 86_400_000;

export function isFutureSourceDate(sourceRateDate: string, businessDate: string) {
  return sourceRateDate > businessDate;
}

export function businessDaysBetween(sourceRateDate: string, businessDate: string) {
  const source = parseIsoDate(sourceRateDate);
  const target = parseIsoDate(businessDate);
  let count = 0;

  for (let cursor = new Date(source.getTime() + MS_PER_DAY); cursor <= target; cursor = new Date(cursor.getTime() + MS_PER_DAY)) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
  }

  return count;
}

export function canCarryForward(sourceRateDate: string, businessDate: string) {
  return !isFutureSourceDate(sourceRateDate, businessDate) && businessDaysBetween(sourceRateDate, businessDate) <= 3;
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Expected an ISO business date");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Expected a valid ISO business date");
  }
  return date;
}
