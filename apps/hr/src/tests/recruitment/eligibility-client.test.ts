import { describe, it, expect } from "vitest";
import {
  evaluate,
  deriveAge,
  RULE_OPERATORS,
  type EligibilityRule,
} from "@/lib/recruitment/eligibility";

function rule(p: Partial<EligibilityRule>): EligibilityRule {
  return { field_key: "age", operator: "gt", value: 30, reject_message: "no", ...p };
}

describe("client eligibility engine (mirror of backend)", () => {
  it("exposes all operators", () => {
    expect(RULE_OPERATORS).toContain("contains");
    expect(RULE_OPERATORS.length).toBe(11);
  });

  it("deriveAge UTC floor + null cases", () => {
    const now = new Date("2026-07-20T00:00:00Z");
    expect(deriveAge("1996-07-20", now)).toBe(30);
    expect(deriveAge("1996-07-21", now)).toBe(29);
    expect(deriveAge(null)).toBeNull();
    expect(deriveAge("")).toBeNull();
    expect(deriveAge("bad")).toBeNull();
  });

  const cases: {
    name: string;
    rule: Partial<EligibilityRule>;
    answers: Record<string, unknown>;
    rejects: boolean;
  }[] = [
    {
      name: "eq",
      rule: { field_key: "d", operator: "eq", value: "n" },
      answers: { d: "n" },
      rejects: true,
    },
    {
      name: "eq no",
      rule: { field_key: "d", operator: "eq", value: "n" },
      answers: { d: "x" },
      rejects: false,
    },
    {
      name: "neq",
      rule: { field_key: "d", operator: "neq", value: "n" },
      answers: { d: "x" },
      rejects: true,
    },
    {
      name: "gt age",
      rule: { field_key: "age", operator: "gt", value: 30 },
      answers: { date_of_birth: "1980-01-01" },
      rejects: true,
    },
    {
      name: "gte",
      rule: { field_key: "y", operator: "gte", value: 5 },
      answers: { y: 5 },
      rejects: true,
    },
    {
      name: "lt",
      rule: { field_key: "y", operator: "lt", value: 2 },
      answers: { y: 1 },
      rejects: true,
    },
    {
      name: "lte",
      rule: { field_key: "y", operator: "lte", value: 2 },
      answers: { y: 2 },
      rejects: true,
    },
    {
      name: "gt non-numeric",
      rule: { field_key: "y", operator: "gt", value: "abc" },
      answers: { y: 5 },
      rejects: false,
    },
    {
      name: "in",
      rule: { field_key: "c", operator: "in", value: ["US"] },
      answers: { c: "US" },
      rejects: true,
    },
    {
      name: "in non-array",
      rule: { field_key: "c", operator: "in", value: "US" },
      answers: { c: "US" },
      rejects: false,
    },
    {
      name: "not_in",
      rule: { field_key: "c", operator: "not_in", value: ["RW"] },
      answers: { c: "US" },
      rejects: true,
    },
    {
      name: "not_in non-array",
      rule: { field_key: "c", operator: "not_in", value: "RW" },
      answers: { c: "US" },
      rejects: false,
    },
    {
      name: "contains str",
      rule: { field_key: "s", operator: "contains", value: "sql" },
      answers: { s: "py, sql" },
      rejects: true,
    },
    {
      name: "contains arr",
      rule: { field_key: "s", operator: "contains", value: "sql" },
      answers: { s: ["sql"] },
      rejects: true,
    },
    {
      name: "contains number",
      rule: { field_key: "s", operator: "contains", value: "x" },
      answers: { s: 42 },
      rejects: false,
    },
    {
      name: "is_true",
      rule: { field_key: "f", operator: "is_true", value: null },
      answers: { f: true },
      rejects: true,
    },
    {
      name: "is_false",
      rule: { field_key: "p", operator: "is_false", value: null },
      answers: { p: false },
      rejects: true,
    },
    {
      name: "is_false absent",
      rule: { field_key: "p", operator: "is_false", value: null },
      answers: {},
      rejects: false,
    },
    {
      name: "missing value",
      rule: { field_key: "d", operator: "eq", value: "n" },
      answers: {},
      rejects: false,
    },
    {
      name: "unknown op",
      rule: { field_key: "x", operator: "regex", value: ".*" },
      answers: { x: "y" },
      rejects: false,
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      expect(evaluate([rule(c.rule)], c.answers).eligible).toBe(!c.rejects);
    });
  }

  it("returns failed reject_message + accumulates", () => {
    const res = evaluate(
      [
        rule({ field_key: "age", operator: "gt", value: 30, reject_message: "Too old" }),
        rule({ field_key: "p", operator: "is_false", value: null, reject_message: "Permit" }),
      ],
      { date_of_birth: "1980-01-01", p: false },
    );
    expect(res.eligible).toBe(false);
    if (!res.eligible)
      expect(res.failed.map((f) => f.reject_message)).toEqual(["Too old", "Permit"]);
  });
});
