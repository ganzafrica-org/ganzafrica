import { describe, it, expect } from "vitest";
import { evaluate, deriveAge, type EligibilityRule } from "@/lib/recruitment/eligibility";

function rule(p: Partial<EligibilityRule>): EligibilityRule {
  return { field_key: "age", operator: "gt", value: 30, reject_message: "Not eligible", ...p };
}

describe("client eligibility mirrors the server", () => {
  it("deriveAge is UTC floor with birthday-today boundary", () => {
    const now = new Date("2026-07-20T00:00:00Z");
    expect(deriveAge("1996-07-20", now)).toBe(30);
    expect(deriveAge("1996-07-21", now)).toBe(29);
    expect(deriveAge("", now)).toBeNull();
  });

  it("fires an age rule and returns the reject message", () => {
    const result = evaluate([rule({ reject_message: "Too old" })], { date_of_birth: "1980-01-01" });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.failed).toEqual([{ field_key: "age", reject_message: "Too old" }]);
    }
  });

  it("permit is_false rule fires only when the field is present and false", () => {
    const r = rule({
      field_key: "has_work_permit",
      operator: "is_false",
      value: null,
      reject_message: "Permit required",
    });
    expect(evaluate([r], { has_work_permit: false }).eligible).toBe(false);
    expect(evaluate([r], {}).eligible).toBe(true); // absent (same country) → no reject
  });

  it("missing value never fails; unknown operator is skipped", () => {
    expect(evaluate([rule({ field_key: "x", operator: "eq", value: "y" })], {}).eligible).toBe(
      true,
    );
    expect(evaluate([rule({ operator: "regex" })], { age: 99 }).eligible).toBe(true);
  });
});
