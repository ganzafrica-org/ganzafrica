export type DepartmentName =
  | "Agriculture"
  | "Environment"
  | "Land Management"
  | "Human Resources"
  | "Administration"
  | "Fellowship Program"
  | "East Africa Operations"
  | "Research & Development";

export type DepartmentStatus = "Active" | "Inactive";

// ─── Full Department entity (used in detail views / header badge) ────────────

export interface Department {
  id: number;
  name: DepartmentName;
  status: DepartmentStatus;
  description?: string;
  headName?: string;
  headTitle?: string;
  location?: string;
  email?: string;
  phone?: string;
  budget?: number;
  employeeCount?: number;
  createdAt?: string;
}

// ─── Table row (used in the department list table) ───────────────────────────

export interface DepartmentTableRow {
  id: number;
  name: DepartmentName;
  status: DepartmentStatus;
  head?: string;
  employeeCount?: number;
  location?: string;
  budget?: number;
}
