/**
 * MOD-01 types on the `employees` model. Replaces employee.types.ts (hr_users shaped), which is
 * deleted once every service is ported.
 */

export type EmploymentType = "fellow" | "analyst" | "staff" | "contractor" | "intern";
export type EmployeeLifecycleStatus =
  | "onboarding"
  | "active"
  | "on_leave"
  | "offboarding"
  | "exited";

/** Fields HR may write. Deliberately disjoint from SELF_EDITABLE_FIELDS. */
export const HR_EDITABLE_FIELDS = [
  "first_name",
  "last_name",
  "employee_number",
  "work_email",
  "job_title",
  "department",
  "employment_type",
  "status",
  "manager_id",
  "hired_at",
] as const;

/** Fields an employee may write about themselves. */
export const SELF_EDITABLE_FIELDS = [
  "phone",
  "picture",
  "personal_email",
  "home_city",
  "home_country",
  "citizenship",
] as const;

export type HrEditableField = (typeof HR_EDITABLE_FIELDS)[number];
export type SelfEditableField = (typeof SELF_EDITABLE_FIELDS)[number];

/**
 * Statuses HR may set directly. `onboarding` is set by the hire flow and cleared by LCM-01;
 * `offboarding`/`exited` belong to LCM-02, so HR cannot jump an employee straight to exited.
 */
export const HR_SETTABLE_STATUSES: EmployeeLifecycleStatus[] = ["active", "on_leave"];

export interface DirectoryRow {
  id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  work_email: string | null;
  personal_email: string | null;
  employee_number: string | null;
  job_title: string | null;
  department: string | null;
  employment_type: string;
  status: string;
  picture: string | null;
  phone: string | null;
  citizenship: string | null;
  home_country: string | null;
  home_city: string | null;
  hired_at: string | null;
  manager: { id: string; first_name: string; last_name: string } | null;
  /** Null when the employees row has no linked users account (a data gap HR can repair). */
  account: { email: string; is_active: boolean } | null;
}

export interface ListEmployeesQuery {
  search?: string;
  department?: string;
  status?: string;
  employment_type?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "department" | "hired_at";
  sortOrder?: "asc" | "desc";
}

export interface EmployeeDetail extends DirectoryRow {
  counts: { assets: number; open_leave: number; documents: number };
  contract: {
    id: string;
    job_title: string;
    status: string;
    start_date: Date;
    end_date: Date | null;
  } | null;
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  personal_email: string;
  work_email?: string | null;
  employee_number?: string | null;
  job_title?: string | null;
  department?: string | null;
  employment_type?: EmploymentType;
  manager_id?: string | null;
  hired_at?: string | null;
  phone?: string | null;
}
