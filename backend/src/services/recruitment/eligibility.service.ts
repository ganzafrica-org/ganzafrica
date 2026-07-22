/**
 * Pre-submission eligibility engine (REC-01).
 *
 * `evaluate` is pure and shipped conceptually to the client too (the frontend re-implements the
 * same logic for live UX); the server is always authoritative. A broken/unknown rule must never
 * block or auto-fail an applicant — it is logged and skipped.
 */
import { inArray, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { eligibility_rules } from "../../db/schema/recruitment/forms";
import { Logger } from "../../config";
import type { EligibilityRuleInput, EligibilityResult, FailedRule } from "../../types/recruitment";

const logger = new Logger("EligibilityService");

type Answers = Record<string, unknown>;

/** UTC-only age in whole years from a date_of_birth (YYYY-MM-DD or Date). Null if unparseable. */
export function deriveAge(dob: unknown, now: Date = new Date()): number | null {
  if (dob == null) return null;
  const birth = dob instanceof Date ? dob : new Date(String(dob));
  if (Number.isNaN(birth.getTime())) return null;

  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Resolve the value a rule's field_key points at. `age` is derived from date_of_birth; everything
 * else is a direct answer lookup.
 */
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

function asArray(v: unknown): unknown[] | null {
  return Array.isArray(v) ? v : null;
}

/**
 * Does this rule REJECT the given answers? A rule rejects when the applicant's value matches its
 * (field, operator, value) predicate — rules describe who is turned away.
 *
 * Missing field value → not a rejection (checked only when the field has a value client-side; at
 * final submit all required fields exist). Unknown operator / malformed operand → not a rejection.
 */
function ruleRejects(rule: EligibilityRuleInput, answers: Answers): boolean {
  const fieldValue = resolveFieldValue(rule.field_key, answers);

  switch (rule.operator) {
    case "is_true":
      return fieldValue === true;
    case "is_false":
      return fieldValue === false;
  }

  // For all remaining operators, a missing value is never a rejection.
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
    case "in": {
      const arr = asArray(rule.value);
      return arr ? arr.includes(fieldValue) : false;
    }
    case "not_in": {
      const arr = asArray(rule.value);
      return arr ? !arr.includes(fieldValue) : false;
    }
    case "contains": {
      // fieldValue may be an array (multiselect) or a string.
      if (Array.isArray(fieldValue)) return fieldValue.includes(rule.value);
      if (typeof fieldValue === "string") return fieldValue.includes(String(rule.value));
      return false;
    }
    default:
      logger.warn(`Skipping rule ${rule.id}: unknown operator "${rule.operator}"`);
      return false;
  }
}

/**
 * Evaluate active rules against submitted answers. Returns the failing rules (with the ids needed
 * to record anonymized hits) or eligible:true.
 */
export function evaluate(rules: EligibilityRuleInput[], answers: Answers): EligibilityResult {
  const failed: FailedRule[] = [];
  const failedRuleIds: number[] = [];

  for (const rule of rules) {
    let rejects = false;
    try {
      rejects = ruleRejects(rule, answers);
    } catch (err) {
      logger.warn(`Skipping rule ${rule.id}: evaluation error`, err as Error);
      rejects = false;
    }
    if (rejects) {
      failed.push({ field_key: rule.field_key, reject_message: rule.reject_message });
      failedRuleIds.push(rule.id);
    }
  }

  if (failed.length === 0) return { eligible: true };
  return { eligible: false, failed, failedRuleIds };
}

/** Increment the anonymized hit counter for the given rule ids in one statement. */
export async function recordHits(ruleIds: number[]): Promise<void> {
  if (ruleIds.length === 0) return;
  await db
    .update(eligibility_rules)
    .set({ hit_count: sql`${eligibility_rules.hit_count} + 1` })
    .where(inArray(eligibility_rules.id, ruleIds));
}
