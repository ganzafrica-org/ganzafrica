/**
 * Recruitment shared types (REC-01). The FormDefinition shape is served to the public form
 * renderer and the HR builder via the API, so it is the single source of truth for both.
 */

export type FormFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "number"
  | "date"
  | "file"
  | "boolean"
  | "country";

export interface FormField {
  key: string; // unique within the form, snake_case
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[]; // select / multiselect
  max_length?: number;
  order: number;
  section: string; // grouping header on the form
}

/**
 * Standard fields are always rendered first and are not removable in the builder. Their keys are
 * fixed: first_name, last_name, email, phone, date_of_birth, country_of_residence,
 * country_of_work, has_work_permit (shown iff residence !== work). The builder may only edit
 * their labels/section grouping, so we keep the same FormField shape for them.
 */
export interface FormDefinition {
  standard: FormField[];
  custom: FormField[];
}

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

/** A rule as evaluated by the engine (the DB row's engine-relevant subset). */
export interface EligibilityRuleInput {
  id: number;
  field_key: string;
  operator: string;
  value: unknown;
  reject_message: string;
}

export interface FailedRule {
  field_key: string;
  reject_message: string;
}

export type EligibilityResult =
  | { eligible: true }
  | { eligible: false; failed: FailedRule[]; failedRuleIds: number[] };
