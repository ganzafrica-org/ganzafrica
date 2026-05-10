import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_users } from "@/db/schema";
import { AppError } from "@/middlewares";

export type UserStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";

export interface EmployeeRequester {
  id: string;
  role?: string;
  email: string;
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

export interface UpdateEmployeeBody {
  firstName?: string;
  lastName?: string;
  department?: string | null;
  position?: string | null;
  location?: string | null;
  email?: string;
  role?: "EMPLOYEE" | "IT" | "HR";
}

function mapUser(u: typeof hr_users.$inferSelect) {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    role: u.role,
    status: u.status,
    department: u.department,
    position: u.position,
    location: u.location,
    joinDate: u.join_date,
    avatarInitials: u.avatar_initials,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

function requireItOrHr(requester: EmployeeRequester): void {
  if (requester.role !== "IT" && requester.role !== "HR") {
    throw new AppError("Forbidden", 403);
  }
}

export async function listEmployees(requester: EmployeeRequester, query: ListEmployeesQuery) {
  requireItOrHr(requester);

  const conditions = [];
  if (query.department) conditions.push(ilike(hr_users.department, `%${query.department}%`));
  if (query.status) conditions.push(eq(hr_users.status, query.status));
  if (query.location) conditions.push(ilike(hr_users.location, `%${query.location}%`));

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const countRows = await db.select({ c: count() }).from(hr_users).where(whereClause);
  const total = Number(countRows[0]?.c ?? 0);

  const orderCol = query.sortBy === "name" ? hr_users.first_name : hr_users.join_date;
  const orderFn = query.sortOrder === "asc" ? asc : desc;

  const rows = await db
    .select()
    .from(hr_users)
    .where(whereClause)
    .orderBy(orderFn(orderCol))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return { data: rows.map(mapUser), total };
}

export async function getEmployeeById(requester: EmployeeRequester, id: string) {
  const isSelf = requester.id === id;
  const elevated = requester.role === "IT" || requester.role === "HR";
  if (!isSelf && !elevated) {
    throw new AppError("Forbidden", 403);
  }

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, id)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);

  return mapUser(rows[0]);
}

export async function updateEmployee(requester: EmployeeRequester, id: string, body: UpdateEmployeeBody) {
  const isSelf = requester.id === id;
  const isIt = requester.role === "IT";
  const isHr = requester.role === "HR";

  if (!isSelf && !isIt && !isHr) {
    throw new AppError("Forbidden", 403);
  }

  if (body.role !== undefined && !isHr) {
    throw new AppError("Forbidden", 403);
  }

  if (body.email !== undefined && !isIt && !isHr) {
    throw new AppError("Forbidden", 403);
  }

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, id)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);

  const patch: Partial<typeof hr_users.$inferInsert> = {
    updated_at: new Date(),
  };

  if (body.firstName !== undefined) patch.first_name = body.firstName;
  if (body.lastName !== undefined) patch.last_name = body.lastName;
  if (body.department !== undefined) patch.department = body.department;
  if (body.position !== undefined) patch.position = body.position;
  if (body.location !== undefined) patch.location = body.location;
  if (body.email !== undefined) patch.email = body.email;
  if (body.role !== undefined) patch.role = body.role;

  const [updated] = await db.update(hr_users).set(patch).where(eq(hr_users.id, id)).returning();
  if (!updated) throw new AppError("Employee not found", 404);

  return mapUser(updated);
}

export async function deleteEmployee(requester: EmployeeRequester, id: string): Promise<void> {
  if (requester.role !== "IT") {
    throw new AppError("Forbidden", 403);
  }
  if (requester.id === id) {
    throw new AppError("Cannot delete your own account", 400);
  }

  const deleted = await db.delete(hr_users).where(eq(hr_users.id, id)).returning({ id: hr_users.id });
  if (!deleted.length) throw new AppError("Employee not found", 404);
}

export async function updateEmployeeStatus(requester: EmployeeRequester, id: string, status: UserStatus) {
  if (requester.role !== "IT") {
    throw new AppError("Forbidden", 403);
  }

  const [updated] = await db
    .update(hr_users)
    .set({ status, updated_at: new Date() })
    .where(eq(hr_users.id, id))
    .returning();

  if (!updated) throw new AppError("Employee not found", 404);

  return mapUser(updated);
}
