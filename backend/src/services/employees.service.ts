import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_users } from "@/db/schema";
import { AppError } from "@/middlewares";

export type HrRole = "EMPLOYEE" | "IT" | "HR";
export type UserStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";

export interface RequestUser {
  id: string;
  role?: string;
  email?: string;
}

export interface ListEmployeesQuery {
  page: number;
  limit: number;
  department?: string;
  status?: UserStatus;
  location?: string;
  sortBy: "name" | "joinDate";
  sortOrder: "asc" | "desc";
}

export interface EmployeeListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarInitials: string;
  position: string | null;
  department: string | null;
  location: string | null;
  status: UserStatus;
  joinDate: Date;
}

export async function listEmployees(
  requester: RequestUser,
  query: ListEmployeesQuery,
): Promise<{ data: EmployeeListItem[]; total: number }> {
  if (requester.role !== "IT" && requester.role !== "HR") {
    throw new AppError("Forbidden", 403);
  }

  const conditions = [];
  if (query.department) conditions.push(eq(hr_users.department, query.department));
  if (query.status) conditions.push(eq(hr_users.status, query.status));
  if (query.location) conditions.push(eq(hr_users.location, query.location));

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const totalRows = await db
    .select({ count: hr_users.id })
    .from(hr_users)
    .where(whereClause);

  const total = totalRows.length;

  const order =
    query.sortBy === "joinDate"
      ? query.sortOrder === "asc"
        ? asc(hr_users.join_date)
        : desc(hr_users.join_date)
      : query.sortOrder === "asc"
        ? asc(hr_users.first_name)
        : desc(hr_users.first_name);

  const rows = await db
    .select()
    .from(hr_users)
    .where(whereClause)
    .orderBy(order, asc(hr_users.last_name))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const data: EmployeeListItem[] = rows.map((u) => ({
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    avatarInitials: u.avatar_initials,
    position: u.position ?? null,
    department: u.department ?? null,
    location: u.location ?? null,
    status: u.status as UserStatus,
    joinDate: u.join_date,
  }));

  return { data, total };
}

export async function getEmployeeById(
  requester: RequestUser,
  employeeId: string,
) {
  if (requester.role !== "IT" && requester.role !== "HR" && requester.id !== employeeId) {
    throw new AppError("Forbidden", 403);
  }

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, employeeId)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);
  const u = rows[0];

  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    avatarInitials: u.avatar_initials,
    position: u.position ?? null,
    department: u.department ?? null,
    location: u.location ?? null,
    status: u.status,
    joinDate: u.join_date,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  department?: string | null;
  position?: string | null;
  location?: string | null;
}

function computeInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().split(/\s+/).filter(Boolean);
  const l = lastName.trim().split(/\s+/).filter(Boolean);
  const chars: string[] = [];
  if (f[0]?.[0]) chars.push(f[0][0]);
  if (f[1]?.[0]) chars.push(f[1][0]);
  if (l[0]?.[0]) chars.push(l[0][0]);
  return (chars.join("") || "NA").toUpperCase();
}

export async function updateEmployee(
  requester: RequestUser,
  employeeId: string,
  input: UpdateEmployeeInput,
) {
  const isSelf = requester.id === employeeId;
  const role = requester.role as HrRole | undefined;

  // EMPLOYEE: own only; HR: own only; IT: any
  if (role === "IT") {
    // ok
  } else if ((role === "EMPLOYEE" || role === "HR") && isSelf) {
    // ok
  } else {
    throw new AppError("Forbidden", 403);
  }

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, employeeId)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);
  const current = rows[0];

  const nextFirst = input.firstName ?? current.first_name;
  const nextLast = input.lastName ?? current.last_name;

  const avatar_initials = computeInitials(nextFirst, nextLast);

  const updated = await db
    .update(hr_users)
    .set({
      first_name: input.firstName ?? undefined,
      last_name: input.lastName ?? undefined,
      department: input.department ?? undefined,
      position: input.position ?? undefined,
      location: input.location ?? undefined,
      avatar_initials,
      updated_at: new Date(),
    })
    .where(eq(hr_users.id, employeeId))
    .returning();

  return updated[0];
}

export async function deleteEmployee(
  requester: RequestUser,
  employeeId: string,
): Promise<void> {
  if (requester.role !== "IT") throw new AppError("Forbidden", 403);
  if (requester.id === employeeId) throw new AppError("Cannot delete your own account", 400);

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, employeeId)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);
  const user = rows[0];

  if (user.role === "IT") throw new AppError("Cannot delete IT users", 400);
  if (user.role === "HR") throw new AppError("Cannot delete HR users", 400);

  await db.delete(hr_users).where(eq(hr_users.id, employeeId));
}

export async function updateEmployeeStatus(
  requester: RequestUser,
  employeeId: string,
  status: UserStatus,
) {
  if (requester.role !== "IT") throw new AppError("Forbidden", 403);

  const rows = await db
    .update(hr_users)
    .set({ status, updated_at: new Date() })
    .where(eq(hr_users.id, employeeId))
    .returning();

  if (!rows.length) throw new AppError("Employee not found", 404);
  return rows[0];
}

