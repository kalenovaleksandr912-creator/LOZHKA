export function parseDateOnly(value, fallback = new Date()) {
  const source = value ? String(value) : fallback.toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(source)) {
    const error = new Error("Date must use YYYY-MM-DD format.");
    error.statusCode = 400;
    throw error;
  }

  return new Date(`${source}T00:00:00.000Z`);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export function isSameMonthDay(left, right) {
  return left.getUTCMonth() === right.getUTCMonth() && left.getUTCDate() === right.getUTCDate();
}
