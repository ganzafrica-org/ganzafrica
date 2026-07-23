/**
 * Working-day arithmetic for MOD-06. Kept free of DB access so the calendar rules stay unit
 * testable; `leave.service.ts` loads the holiday set and calls in.
 *
 * Leave dates are calendar days — all math is done in UTC to avoid a local timezone shifting a
 * request across a day boundary.
 */

/** `YYYY-MM-DD` in UTC, the shape used for holiday lookups. */
export function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function isWeekend(value: Date): boolean {
  const day = value.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Working days in [start, end] inclusive: Mon–Fri minus `holidays` (ISO date strings).
 * Returns 0 for an inverted range so callers can reject it as a validation error.
 */
export function countWorkingDays(start: Date, end: Date, holidays: ReadonlySet<string>): number {
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const last = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

  let days = 0;
  while (cursor.getTime() <= last) {
    if (!isWeekend(cursor) && !holidays.has(toIsoDate(cursor))) days++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

/** Calendar years a range touches — a Dec→Jan request draws on two balance years. */
export function yearsSpanned(start: Date, end: Date): number[] {
  const first = start.getUTCFullYear();
  const last = end.getUTCFullYear();
  if (last < first) return [];
  return Array.from({ length: last - first + 1 }, (_, i) => first + i);
}
