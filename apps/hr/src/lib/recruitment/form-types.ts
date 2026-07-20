/**
 * Form definition types (REC-01) — mirror of backend `types/recruitment.ts`. Served by the API
 * and consumed by both the public renderer and the HR builder.
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
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  max_length?: number;
  order: number;
  section: string;
}

export interface FormDefinition {
  standard: FormField[];
  custom: FormField[];
}

/** Fixed standard-field keys the builder renders locked. */
export const STANDARD_FIELD_KEYS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "date_of_birth",
  "country_of_residence",
  "country_of_work",
  "has_work_permit",
] as const;

/** Field keys usable in eligibility rules: derived `age` + the standard country/permit fields. */
export const STANDARD_RULE_KEYS = [
  "age",
  "country_of_residence",
  "country_of_work",
  "has_work_permit",
] as const;
