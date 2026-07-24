/**
 * MOD-06 §6.1 — working-day arithmetic. Pure function over an injected holiday set, so these stay
 * unit-fast; the DB-backed variant is covered in the integration suite.
 */
import { describe, it, expect } from "vitest";
import { countWorkingDays } from "../../src/services/hr/leave-days";

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("countWorkingDays", () => {
  it("counts a plain Mon–Fri week as 5 days", () => {
    expect(countWorkingDays(d("2026-01-05"), d("2026-01-09"), new Set())).toBe(5);
  });

  it("excludes the weekend inside a span", () => {
    // Fri 2026-01-09 → Mon 2026-01-12 spans Sat+Sun.
    expect(countWorkingDays(d("2026-01-09"), d("2026-01-12"), new Set())).toBe(2);
  });

  it("counts a single weekday as 1", () => {
    expect(countWorkingDays(d("2026-01-06"), d("2026-01-06"), new Set())).toBe(1);
  });

  it("counts a single weekend day as 0", () => {
    expect(countWorkingDays(d("2026-01-10"), d("2026-01-10"), new Set())).toBe(0);
  });

  it("excludes org holidays that fall on weekdays", () => {
    const holidays = new Set(["2026-01-07"]);
    expect(countWorkingDays(d("2026-01-05"), d("2026-01-09"), holidays)).toBe(4);
  });

  it("does not double-subtract a holiday landing on a weekend", () => {
    const holidays = new Set(["2026-01-10"]);
    expect(countWorkingDays(d("2026-01-05"), d("2026-01-11"), holidays)).toBe(5);
  });

  it("returns 0 when the range is inverted", () => {
    expect(countWorkingDays(d("2026-01-09"), d("2026-01-05"), new Set())).toBe(0);
  });

  it("handles a span crossing a year boundary", () => {
    // Wed 2026-12-30, Thu 12-31, Fri 2027-01-01 → 3 working days (no holidays configured).
    expect(countWorkingDays(d("2026-12-30"), d("2027-01-01"), new Set())).toBe(3);
  });
});
