export type HrRole = "EMPLOYEE" | "IT" | "HR";
export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED";

export interface HrRequester {
  id: string;
  role: HrRole;
  email?: string;
}

export interface EmployeeRecord {
  id: string;
  platformUserId: number | null;
  firstName: string;
  lastName: string;
  personalEmail: string;
  workEmail: string | null;
  phone: string | null;
  picture: string | null;
  citizenship: string | null;
  homeCountry: string | null;
  homeCity: string | null;
  role: HrRole;
  status: EmployeeStatus;
  avatarInitials: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListEmployeesQuery {
  page?: number;
  limit?: number;
  status?: EmployeeStatus;
  location?: string;
  sortBy?: "name" | "hireDate";
  sortOrder?: "asc" | "desc";
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  personalEmail: string;
  workEmail?: string | null;
  phone?: string | null;
  picture?: string | null;
  citizenship?: string | null;
  homeCountry?: string | null;
  homeCity?: string | null;
  role?: HrRole;
  platformUserId?: number;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  workEmail?: string | null;
  phone?: string | null;
  picture?: string | null;
  citizenship?: string | null;
  homeCountry?: string | null;
  homeCity?: string | null;
}
