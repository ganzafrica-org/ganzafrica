import { randomBytes } from "crypto";
import * as bcrypt from "bcryptjs";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_users, users } from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification, resolveTriggeredByFromHrUser } from "@/modules/hr/notifications/notification.service";
import type {
  CreateEmployeeInput,
  EmployeeRecord,
  EmployeeStatus,
  HrRequester,
  HrRole,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from "@/types/employee.types";

function buildInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().split(/\s+/).filter(Boolean);
  const last = lastName.trim().split(/\s+/).filter(Boolean);
  const chars: string[] = [];
  if (first[0]?.[0]) chars.push(first[0][0]);
  if (last[0]?.[0]) chars.push(last[0][0]);
  if (chars.length === 0) return "NA";
  return chars.join("").toUpperCase();
}

function mapEmployee(row: typeof hr_users.$inferSelect): EmployeeRecord {
  return {
    id: row.id,
    platformUserId: row.platform_user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    picture: row.picture,
    role: row.role as HrRole,
    status: row.status as EmployeeStatus,
    department: row.department,
    position: row.position,
    location: row.location,
    hireDate: row.join_date,
    avatarInitials: row.avatar_initials,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function assertEmployeeAccess(
  requester: HrRequester,
  employeeId: string,
  allowedRoles: HrRole[],
): void {
  if (!allowedRoles.includes(requester.role)) {
    throw new AppError("Forbidden", 403);
  }
  if (requester.role === "EMPLOYEE" && requester.id !== employeeId) {
    throw new AppError("Forbidden", 403);
  }
}

async function assertPlatformUserExists(platformUserId: number): Promise<void> {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.id, platformUserId)).limit(1);
  if (!rows.length) throw new AppError("Platform user not found", 404);
}

export async function getActiveEmployee(employeeId: string): Promise<typeof hr_users.$inferSelect> {
  const rows = await db.select().from(hr_users).where(eq(hr_users.id, employeeId)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);
  if (rows[0].status !== "ACTIVE") throw new AppError("Employee is not active", 400);
  return rows[0];
}

export async function listEmployees(
  requester: HrRequester,
  query: ListEmployeesQuery = {},
): Promise<{ data: EmployeeRecord[]; total: number }> {
  if (requester.role !== "IT" && requester.role !== "HR") {
    throw new AppError("Forbidden", 403);
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
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
    .limit(limit)
    .offset((page - 1) * limit);

  return { data: rows.map(mapEmployee), total };
}

export async function getEmployeeMe(requester: HrRequester): Promise<EmployeeRecord> {
  return getEmployeeById(requester, requester.id);
}

export async function getEmployeeById(requester: HrRequester, id: string): Promise<EmployeeRecord> {
  assertEmployeeAccess(requester, id, ["IT", "HR", "EMPLOYEE"]);

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, id)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);

  return mapEmployee(rows[0]);
}

export async function createEmployee(
  requester: HrRequester,
  input: CreateEmployeeInput,
): Promise<EmployeeRecord> {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  const existing = await db
    .select({ id: hr_users.id })
    .from(hr_users)
    .where(eq(hr_users.email, input.email))
    .limit(1);
  if (existing.length) throw new AppError("Email already in use", 409);

  if (input.platformUserId !== undefined) {
    await assertPlatformUserExists(input.platformUserId);
  }

  const tempPassword = randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const role = input.role ?? "EMPLOYEE";

  const [inserted] = await db
    .insert(hr_users)
    .values({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      picture: input.picture ?? null,
      password_hash: passwordHash,
      role,
      status: "ACTIVE",
      department: input.department ?? null,
      position: input.position ?? null,
      location: input.location ?? null,
      join_date: input.hireDate,
      avatar_initials: buildInitials(input.firstName, input.lastName),
      platform_user_id: input.platformUserId ?? null,
      profile_setup_completed: false,
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create employee", 400);

  try {
    await sendNotification({
      type: "EMPLOYEE_CREATED",
      triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
      relatedEntity: { employeeId: inserted.id },
      title: "New employee added",
      message: `${inserted.first_name} ${inserted.last_name} has been added to the HR portal.`,
      priority: "HIGH",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return mapEmployee(inserted);
}

export async function updateEmployee(
  requester: HrRequester,
  id: string,
  input: UpdateEmployeeInput,
): Promise<EmployeeRecord> {
  if (requester.role !== "IT" && requester.role !== "HR") {
    throw new AppError("Forbidden", 403);
  }

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, id)).limit(1);
  if (!rows.length) throw new AppError("Employee not found", 404);

  if (input.email && input.email !== rows[0].email) {
    const dup = await db
      .select({ id: hr_users.id })
      .from(hr_users)
      .where(eq(hr_users.email, input.email))
      .limit(1);
    if (dup.length) throw new AppError("Email already in use", 409);
  }

  const patch: Partial<typeof hr_users.$inferInsert> = { updated_at: new Date() };

  if (input.firstName !== undefined) patch.first_name = input.firstName;
  if (input.lastName !== undefined) patch.last_name = input.lastName;
  if (input.email !== undefined) patch.email = input.email;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.picture !== undefined) patch.picture = input.picture;
  if (input.department !== undefined) patch.department = input.department;
  if (input.position !== undefined) patch.position = input.position;
  if (input.location !== undefined) patch.location = input.location;
  if (input.hireDate !== undefined) patch.join_date = input.hireDate;

  const firstName = input.firstName ?? rows[0].first_name;
  const lastName = input.lastName ?? rows[0].last_name;
  if (input.firstName !== undefined || input.lastName !== undefined) {
    patch.avatar_initials = buildInitials(firstName, lastName);
  }

  const [updated] = await db.update(hr_users).set(patch).where(eq(hr_users.id, id)).returning();
  if (!updated) throw new AppError("Employee not found", 404);

  return mapEmployee(updated);
}

export async function softDeleteEmployee(requester: HrRequester, id: string): Promise<EmployeeRecord> {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  const [updated] = await db
    .update(hr_users)
    .set({ status: "INACTIVE", updated_at: new Date() })
    .where(eq(hr_users.id, id))
    .returning();

  if (!updated) throw new AppError("Employee not found", 404);

  try {
    await sendNotification({
      type: "EMPLOYEE_STATUS_CHANGED",
      triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
      relatedEntity: { employeeId: updated.id },
      title: "Employee status updated",
      message: `${updated.first_name} ${updated.last_name}'s status is now ${updated.status}.`,
      priority: "NORMAL",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return mapEmployee(updated);
}
