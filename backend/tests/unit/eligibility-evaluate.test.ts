import { describe, it, expect } from "vitest";
import { evaluate, deriveAge } from "../../src/services/recruitment/eligibility.service";
import type { EligibilityRuleInput } from "../../src/types/recruitment";

let ruleSeq = 0;
function rule(partial: Partial<EligibilityRuleInput>): EligibilityRuleInput {
  return {
    id: ++ruleSeq,
    field_key: "age",
    operator: "gt",
    value: 30,
    reject_message: "Not eligible",
    ...partial,
  };
}

describe("deriveAge (UTC, floor)", () => {
  it("computes whole years", () => {
    const now = new Date("2026-07-20T00:00:00Z");
    expect(deriveAge("1996-07-20", now)).toBe(30);
    expect(deriveAge("1996-07-21", now)).toBe(29); // birthday tomorrow
    expect(deriveAge("1996-07-19", now)).toBe(30); // birthday yesterday
  });

  it("boundary: birthday today counts", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(deriveAge("2000-01-01", now)).toBe(26);
  });

  it("returns null for missing/unparseable dob", () => {
    expect(deriveAge(null)).toBeNull();
    expect(deriveAge(undefined)).toBeNull();
    expect(deriveAge("not-a-date")).toBeNull();
  });
});

describe("evaluate — operator table", () => {
  const cases: {
    name: string;
    rule: Partial<EligibilityRuleInput>;
    answers: Record<string, unknown>;
    rejects: boolean;
  }[] = [
    {
      name: "eq match",
      rule: { field_key: "degree", operator: "eq", value: "none" },
      answers: { degree: "none" },
      rejects: true,
    },
    {
      name: "eq no match",
      rule: { field_key: "degree", operator: "eq", value: "none" },
      answers: { degree: "bsc" },
      rejects: false,
    },
    {
      name: "neq match",
      rule: { field_key: "degree", operator: "neq", value: "bsc" },
      answers: { degree: "none" },
      rejects: true,
    },
    {
      name: "gt match",
      rule: { field_key: "age", operator: "gt", value: 30 },
      answers: { date_of_birth: "1990-01-01" },
      rejects: true,
    },
    {
      name: "gte boundary",
      rule: { field_key: "years", operator: "gte", value: 5 },
      answers: { years: 5 },
      rejects: true,
    },
    {
      name: "lt match",
      rule: { field_key: "years", operator: "lt", value: 2 },
      answers: { years: 1 },
      rejects: true,
    },
    {
      name: "lte boundary",
      rule: { field_key: "years", operator: "lte", value: 2 },
      answers: { years: 2 },
      rejects: true,
    },
    {
      name: "in match",
      rule: { field_key: "country", operator: "in", value: ["US", "UK"] },
      answers: { country: "US" },
      rejects: true,
    },
    {
      name: "not_in match",
      rule: { field_key: "country", operator: "not_in", value: ["RW"] },
      answers: { country: "US" },
      rejects: true,
    },
    {
      name: "not_in no match",
      rule: { field_key: "country", operator: "not_in", value: ["RW"] },
      answers: { country: "RW" },
      rejects: false,
    },
    {
      name: "contains string",
      rule: { field_key: "skills", operator: "contains", value: "sql" },
      answers: { skills: "python, sql" },
      rejects: true,
    },
    {
      name: "contains array",
      rule: { field_key: "skills", operator: "contains", value: "sql" },
      answers: { skills: ["python", "sql"] },
      rejects: true,
    },
    {
      name: "is_true match",
      rule: { field_key: "flagged", operator: "is_true", value: null },
      answers: { flagged: true },
      rejects: true,
    },
    {
      name: "is_false match",
      rule: { field_key: "has_work_permit", operator: "is_false", value: null },
      answers: { has_work_permit: false },
      rejects: true,
    },
    {
      name: "is_false when true",
      rule: { field_key: "has_work_permit", operator: "is_false", value: null },
      answers: { has_work_permit: true },
      rejects: false,
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const result = evaluate([rule(c.rule)], c.answers);
      expect(result.eligible).toBe(!c.rejects);
    });
  }

  it("returns failed field_key + reject_message on rejection", () => {
    const r = rule({ field_key: "age", operator: "gt", value: 30, reject_message: "Too old" });
    const result = evaluate([r], { date_of_birth: "1980-01-01" });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.failed).toEqual([{ field_key: "age", reject_message: "Too old" }]);
      expect(result.failedRuleIds).toEqual([r.id]);
    }
  });

  it("missing field value is NOT a failure (client-side partial state)", () => {
    const result = evaluate([rule({ field_key: "degree", operator: "eq", value: "none" })], {});
    expect(result.eligible).toBe(true);
  });

  it("has_work_permit rule only fires when countries differ is caller's concern; engine treats is_false literally", () => {
    // The permit field is only present when residence != work; a present false => reject.
    const r = rule({
      field_key: "has_work_permit",
      operator: "is_false",
      value: null,
      reject_message: "Permit required",
    });
    expect(evaluate([r], { has_work_permit: false }).eligible).toBe(false);
    expect(evaluate([r], {}).eligible).toBe(true); // field absent (same country) => no reject
  });

  it("unknown operator is skipped, never blocks or auto-fails", () => {
    const r = rule({ field_key: "x", operator: "regex_match", value: ".*" });
    expect(evaluate([r], { x: "anything" }).eligible).toBe(true);
  });

  it("multiple failing rules accumulate", () => {
    const r1 = rule({ field_key: "age", operator: "gt", value: 30, reject_message: "Too old" });
    const r2 = rule({
      field_key: "has_work_permit",
      operator: "is_false",
      value: null,
      reject_message: "Permit required",
    });
    const result = evaluate([r1, r2], { date_of_birth: "1980-01-01", has_work_permit: false });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.failedRuleIds).toEqual([r1.id, r2.id]);
    }
  });
});
