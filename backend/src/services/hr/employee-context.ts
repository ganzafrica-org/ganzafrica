import { db } from "../../db/client";
import { employees, user_roles, roles } from "../../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../../middlewares";

export interface EmployeeContext {
  employeeId: string;
  userId: number;
  roleNames: string[];
}

/**
 * Resolve the employee profile for an authenticated platform user. Throws
 * EMPLOYEE_PROFILE_MISSING when the user has no employees row (the FND-05 merge missed them, or
 * they are an admin/hr with no own profile — callers that only manage others should not require this).
 */
export async function getEmployeeForUser(userId: number): Promise<EmployeeContext> {
  const [emp] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.user_id, userId))
    .limit(1);

  if (!emp) {
    throw new AppError(
      "No employee profile found for this account",
      404,
      "EMPLOYEE_PROFILE_MISSING",
    );
  }

  const roleRows = await db
    .select({ name: roles.name })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId));

  return { employeeId: emp.id, userId, roleNames: roleRows.map((r) => r.name) };
}

/** Roles that grant HR-management capability regardless of an own employee profile. */
export function isHrManager(roleNames: string[]): boolean {
  return roleNames.includes("hr") || roleNames.includes("admin");
}

/**
 * Fetch an employees row by id or 404. The employees-model replacement for the legacy
 * `getActiveEmployee` (which read hr_users) — it does NOT assert active status, because contracts
 * and documents are legitimately attached to onboarding and exited employees too.
 */
export async function requireEmployee(employeeId: string) {
  const [row] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
  if (!row) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  return row;
}

// Bounds the manager-chain walk so a cycle in manager_id can never hang a request.
const MAX_MANAGER_DEPTH = 20;

/**
 * True when `actorEmployeeId` is the subject's direct manager or anywhere above them in the
 * `employees.manager_id` chain — skip-level managers approve too. Used for leave approval routing
 * (MOD-06) and process-task assignment (LCM-01).
 */
export async function isManagerOf(
  actorEmployeeId: string,
  subjectEmployeeId: string,
): Promise<boolean> {
  if (actorEmployeeId === subjectEmployeeId) return false;

  let currentId: string = subjectEmployeeId;
  const seen = new Set<string>([subjectEmployeeId]);

  for (let depth = 0; depth < MAX_MANAGER_DEPTH; depth++) {
    const rows = await db
      .select({ managerId: employees.manager_id })
      .from(employees)
      .where(eq(employees.id, currentId))
      .limit(1);

    const managerId: string | null = rows[0]?.managerId ?? null;
    if (!managerId) return false;
    if (managerId === actorEmployeeId) return true;
    if (seen.has(managerId)) return false;

    seen.add(managerId);
    currentId = managerId;
  }

  return false;
}

/**
 * Who decides an employee's leave: their manager's user account, or null when they sit at the top
 * of the tree (callers fall back to the HR queue).
 */
export async function getManagerUserId(employeeId: string): Promise<number | null> {
  const [subject] = await db
    .select({ managerId: employees.manager_id })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);

  if (!subject?.managerId) return null;

  const [manager] = await db
    .select({ userId: employees.user_id })
    .from(employees)
    .where(eq(employees.id, subject.managerId))
    .limit(1);

  return manager?.userId ?? null;
}

/**
 * Legacy-shape "requester" the HR services still expect ({id, role, email}). Bridges the new
 * platform identity to the old hr enum during the transition (HR services get retired onto the
 * employees table in MOD-01). `id` is the employee uuid when the user has a profile, else the
 * users.id as a string for HR-management accounts without their own profile.
 */
export async function getHrRequester(
  userId: number,
  email: string,
): Promise<{ id: string; role: "HR" | "IT" | "EMPLOYEE"; email: string }> {
  const roleRows = await db
    .select({ name: roles.name })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId));
  const roleNames = roleRows.map((r) => r.name);

  // admin and hr both get full HR-level access in the (transitional) HR services. The legacy
  // "IT" enum was more restricted than "HR" in those services, so admin must NOT map to it.
  const role: "HR" | "IT" | "EMPLOYEE" =
    roleNames.includes("admin") || roleNames.includes("hr") ? "HR" : "EMPLOYEE";

  const [emp] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.user_id, userId))
    .limit(1);

  return { id: emp?.id ?? String(userId), role, email };
}
