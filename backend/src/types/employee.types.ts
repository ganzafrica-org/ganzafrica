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
  email: string;
  phone: string | null;
  picture: string | null;
  role: HrRole;
  status: EmployeeStatus;
  department: string | null;
  position: string | null;
  location: string | null;
  hireDate: Date;
  avatarInitials: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListEmployeesQuery {
  page?: number;
  limit?: number;
  department?: string;
  status?: EmployeeStatus;
  location?: string;
  sortBy?: "name" | "hireDate";
  sortOrder?: "asc" | "desc";
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  hireDate: Date;
  phone?: string | null;
  picture?: string | null;
  department?: string | null;
  position?: string | null;
  location?: string | null;
  role?: HrRole;
  platformUserId?: number;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  picture?: string | null;
  department?: string | null;
  position?: string | null;
  location?: string | null;
  hireDate?: Date;
}
