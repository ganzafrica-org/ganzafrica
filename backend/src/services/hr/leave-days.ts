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

export type SummaryWindow = "week" | "month" | "year";

/**
 * [from, to] for the window containing `now`, in UTC — same Date.UTC/getUTCDay/setUTCDate
 * convention as the rest of this file, so this doesn't drift from the leave-day math above.
 * "week" is Monday-Sunday (ISO week).
 */
export function windowBounds(
  window: SummaryWindow,
  now: Date = new Date(),
): { from: Date; to: Date } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  if (window === "year") {
    return { from: new Date(Date.UTC(y, 0, 1)), to: new Date(Date.UTC(y, 11, 31)) };
  }
  if (window === "month") {
    return { from: new Date(Date.UTC(y, m, 1)), to: new Date(Date.UTC(y, m + 1, 0)) };
  }

  // ISO week: Monday..Sunday. getUTCDay() is 0=Sun..6=Sat; treat Sunday as day 7 so the offset
  // back to Monday is always 0-6, not a negative wrap.
  const dow = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
  const monday = new Date(Date.UTC(y, m, d - (dow - 1)));
  const sunday = new Date(Date.UTC(y, m, d - (dow - 1) + 6));
  return { from: monday, to: sunday };
}
