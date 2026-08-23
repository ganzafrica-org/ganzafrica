/**
 * MOD-06 §6.1 — working-day arithmetic. Pure function over an injected holiday set, so these stay
 * unit-fast; the DB-backed variant is covered in the integration suite.
 */
import { describe, it, expect } from "vitest";
import { countWorkingDays, windowBounds, toIsoDate } from "../../src/services/hr/leave-days";

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

describe("windowBounds (punch-list #8)", () => {
  it("week: Monday through Sunday of the containing ISO week", () => {
    // 2026-03-04 is a Wednesday.
    const { from, to } = windowBounds("week", d("2026-03-04"));
    expect(toIsoDate(from)).toBe("2026-03-02"); // Monday
    expect(toIsoDate(to)).toBe("2026-03-08"); // Sunday
  });

  it("week: a Sunday belongs to the week that just ended, not the next one", () => {
    const { from, to } = windowBounds("week", d("2026-03-08")); // Sunday
    expect(toIsoDate(from)).toBe("2026-03-02");
    expect(toIsoDate(to)).toBe("2026-03-08");
  });

  it("week: crossing a month boundary", () => {
    // 2026-03-01 is a Sunday, so its week is Mon 2026-02-23 through Sun 2026-03-01.
    const { from, to } = windowBounds("week", d("2026-03-01"));
    expect(toIsoDate(from)).toBe("2026-02-23");
    expect(toIsoDate(to)).toBe("2026-03-01");
  });

  it("month: first through last calendar day, including a 31-day and a 28-day month", () => {
    const march = windowBounds("month", d("2026-03-15"));
    expect(toIsoDate(march.from)).toBe("2026-03-01");
    expect(toIsoDate(march.to)).toBe("2026-03-31");

    const feb = windowBounds("month", d("2026-02-10")); // 2026 is not a leap year
    expect(toIsoDate(feb.from)).toBe("2026-02-01");
    expect(toIsoDate(feb.to)).toBe("2026-02-28");
  });

  it("month: December stays in the same year (no rollover bug from month + 1)", () => {
    const dec = windowBounds("month", d("2026-12-15"));
    expect(toIsoDate(dec.from)).toBe("2026-12-01");
    expect(toIsoDate(dec.to)).toBe("2026-12-31");
  });

  it("year: January 1 through December 31", () => {
    const { from, to } = windowBounds("year", d("2026-06-15"));
    expect(toIsoDate(from)).toBe("2026-01-01");
    expect(toIsoDate(to)).toBe("2026-12-31");
  });
});
