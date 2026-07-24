/**
 * Client-side eligibility engine (REC-01) — a faithful mirror of the backend
 * `services/recruitment/eligibility.service.ts`. The server is always authoritative; this exists
 * so the builder can preview rules and the public form can block instantly on blur/change.
 *
 * Keep in sync with the backend: a missing field value is never a failure, and an unknown/broken
 * operator is skipped (never blocks or auto-fails).
 */

export type RuleOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "contains"
  | "is_true"
  | "is_false";

export const RULE_OPERATORS: readonly RuleOperator[] = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "contains",
  "is_true",
  "is_false",
] as const;

export interface EligibilityRule {
  field_key: string;
  operator: string;
  value?: unknown;
  reject_message: string;
}

export interface FailedRule {
  field_key: string;
  reject_message: string;
}

export type EligibilityResult = { eligible: true } | { eligible: false; failed: FailedRule[] };

type Answers = Record<string, unknown>;

/** UTC-only whole-year age from a date_of_birth (YYYY-MM-DD or Date). Null if unparseable. */
export function deriveAge(dob: unknown, now: Date = new Date()): number | null {
  if (dob == null || dob === "") return null;
  const birth = dob instanceof Date ? dob : new Date(String(dob));
  if (Number.isNaN(birth.getTime())) return null;

  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age;
}

function resolveFieldValue(fieldKey: string, answers: Answers): unknown {
  if (fieldKey === "age") return deriveAge(answers["date_of_birth"]);
  return answers[fieldKey];
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isNaN(v) ? null : v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function ruleRejects(rule: EligibilityRule, answers: Answers): boolean {
  const fieldValue = resolveFieldValue(rule.field_key, answers);

  if (rule.operator === "is_true") return fieldValue === true;
  if (rule.operator === "is_false") return fieldValue === false;

  if (fieldValue == null || fieldValue === "") return false;

  switch (rule.operator) {
    case "eq":
      return fieldValue === rule.value;
    case "neq":
      return fieldValue !== rule.value;
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      const a = toNumber(fieldValue);
      const b = toNumber(rule.value);
      if (a == null || b == null) return false;
      if (rule.operator === "gt") return a > b;
      if (rule.operator === "gte") return a >= b;
      if (rule.operator === "lt") return a < b;
      return a <= b;
    }
    case "in":
      return Array.isArray(rule.value) ? rule.value.includes(fieldValue) : false;
    case "not_in":
      return Array.isArray(rule.value) ? !rule.value.includes(fieldValue) : false;
    case "contains":
      if (Array.isArray(fieldValue)) return fieldValue.includes(rule.value);
      if (typeof fieldValue === "string") return fieldValue.includes(String(rule.value));
      return false;
    default:
      return false; // unknown operator → never blocks
  }
}

/** Evaluate active rules against answers. Returns failing rules or eligible:true. */
export function evaluate(rules: EligibilityRule[], answers: Answers): EligibilityResult {
  const failed: FailedRule[] = [];
  for (const rule of rules) {
    let rejects = false;
    try {
      rejects = ruleRejects(rule, answers);
    } catch {
      rejects = false;
    }
    if (rejects) failed.push({ field_key: rule.field_key, reject_message: rule.reject_message });
  }
  return failed.length === 0 ? { eligible: true } : { eligible: false, failed };
}
