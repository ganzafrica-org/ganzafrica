/**
 * MOD-01 employees module on the `employees` model, joined to `users` for account state.
 *
 * The field-set split is the heart of this service: HR and the employee themselves write
 * *disjoint* sets of columns, enforced server-side. An employee cannot promote themselves by
 * PATCHing `job_title`, and HR does not silently overwrite someone's personal phone number.
 */
import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import {
  employees,
  hr_assets,
  hr_contracts,
  hr_documents,
  hr_leaves,
  roles,
  user_roles,
  users,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import { hashPassword } from "../auth.service";
import { randomBytes } from "crypto";
import { getEmployeeForUser } from "./employee-context";
import {
  HR_EDITABLE_FIELDS,
  HR_SETTABLE_STATUSES,
  SELF_EDITABLE_FIELDS,
  type CreateEmployeeInput,
  type DirectoryRow,
  type EmployeeDetail,
  type ListEmployeesQuery,
} from "@/types/employees.types";

export function buildInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().split(/\s+/).filter(Boolean)[0]?.[0] ?? "";
  const last = lastName.trim().split(/\s+/).filter(Boolean)[0]?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "NA";
}

async function hasAnyRole(userId: number, names: string[]): Promise<boolean> {
  const rows = await db
    .select({ name: roles.name })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId));
  return rows.some((r) => names.includes(r.name));
}

export const canManageEmployees = (userId: number) => hasAnyRole(userId, ["hr", "admin"]);

/**
 * Delegates to the shared `getEmployeeForUser` seam (employee-context.ts) rather than querying
 * `employees` directly, so FND-07's swap to `getEmployeeForUser` touches only that one file.
 * Nullable here (unlike the seam, which throws) because callers use this for an own-row check
 * that must tolerate "no profile" rather than fail the whole request.
 */
async function employeeIdForUser(userId: number): Promise<string | null> {
  try {
    return (await getEmployeeForUser(userId)).employeeId;
  } catch {
    return null;
  }
}

/**
 * Rejects a patch touching keys outside the caller's allowed set, naming every offender so the
 * client can show which fields were refused rather than a bare 422.
 */
function assertFieldSet(
  patch: Record<string, unknown>,
  allowed: readonly string[],
  who: "HR" | "self",
) {
  const offenders = Object.keys(patch).filter((k) => !allowed.includes(k));
  if (offenders.length) {
    throw new AppError(
      `${who === "HR" ? "HR" : "You"} cannot edit: ${offenders.join(", ")}`,
      422,
      "FIELD_NOT_EDITABLE",
    );
  }
}

const DIRECTORY_COLUMNS = {
  id: employees.id,
  user_id: employees.user_id,
  first_name: employees.first_name,
  last_name: employees.last_name,
  work_email: employees.work_email,
  personal_email: employees.personal_email,
  employee_number: employees.employee_number,
  job_title: employees.job_title,
  department: employees.department,
  employment_type: employees.employment_type,
  status: employees.status,
  picture: employees.picture,
  phone: employees.phone,
  citizenship: employees.citizenship,
  home_country: employees.home_country,
  home_city: employees.home_city,
  hired_at: employees.hired_at,
  manager_id: employees.manager_id,
  account_email: users.email,
  account_active: users.is_active,
};

type DirectoryQueryRow = {
  [K in keyof typeof DIRECTORY_COLUMNS]: unknown;
};

async function attachManagers(rows: DirectoryQueryRow[]): Promise<DirectoryRow[]> {
  const managerIds = [
    ...new Set(rows.map((r) => r.manager_id as string | null).filter((id): id is string => !!id)),
  ];

  const managerRows = managerIds.length
    ? await db
        .select({
          id: employees.id,
          first_name: employees.first_name,
          last_name: employees.last_name,
        })
        .from(employees)
        .where(sql`${employees.id} IN ${managerIds}`)
    : [];

  const byId = new Map(managerRows.map((m) => [m.id, m]));

  return rows.map((r) => ({
    id: r.id as string,
    user_id: r.user_id as number,
    first_name: r.first_name as string,
    last_name: r.last_name as string,
    work_email: r.work_email as string | null,
    personal_email: r.personal_email as string | null,
    employee_number: r.employee_number as string | null,
    job_title: r.job_title as string | null,
    department: r.department as string | null,
    employment_type: r.employment_type as string,
    status: r.status as string,
    picture: r.picture as string | null,
    phone: r.phone as string | null,
    citizenship: r.citizenship as string | null,
    home_country: r.home_country as string | null,
    home_city: r.home_city as string | null,
    hired_at: r.hired_at as string | null,
    manager: byId.get(r.manager_id as string) ?? null,
    account: r.account_email
      ? { email: r.account_email as string, is_active: r.account_active as boolean }
      : null,
  }));
}

/** Paged directory. Server-side pagination only — never fetch-all. */
export async function listEmployees(query: ListEmployeesQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(200, Math.max(1, query.limit ?? 25));

  const conditions = [];
  if (query.status) conditions.push(eq(employees.status, query.status));
  if (query.department) conditions.push(eq(employees.department, query.department));
  if (query.employment_type) conditions.push(eq(employees.employment_type, query.employment_type));
  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    conditions.push(
      or(
        ilike(employees.first_name, term),
        ilike(employees.last_name, term),
        ilike(employees.work_email, term),
        ilike(employees.personal_email, term),
        ilike(employees.job_title, term),
        ilike(employees.employee_number, term),
      ),
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(employees)
    .where(where);

  const sortColumn =
    query.sortBy === "department"
      ? employees.department
      : query.sortBy === "hired_at"
        ? employees.hired_at
        : employees.first_name;
  const direction = query.sortOrder === "desc" ? desc : asc;

  const rows = await db
    .select(DIRECTORY_COLUMNS)
    .from(employees)
    .leftJoin(users, eq(users.id, employees.user_id))
    .where(where)
    .orderBy(direction(sortColumn))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    data: await attachManagers(rows as DirectoryQueryRow[]),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

async function requireEmployeeRow(employeeId: string) {
  const [row] = await db
    .select(DIRECTORY_COLUMNS)
    .from(employees)
    .leftJoin(users, eq(users.id, employees.user_id))
    .where(eq(employees.id, employeeId))
    .limit(1);
  if (!row) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  return row as DirectoryQueryRow;
}

/** Full detail: profile, current contract summary, and the counts the tabs badge. */
export async function getEmployeeDetail(
  viewerUserId: number,
  employeeId: string,
): Promise<EmployeeDetail> {
  const canManage = await canManageEmployees(viewerUserId);
  if (!canManage && (await employeeIdForUser(viewerUserId)) !== employeeId) {
    throw new AppError("You cannot view this employee", 403, "FORBIDDEN");
  }

  const row = await requireEmployeeRow(employeeId);
  const [base] = await attachManagers([row]);

  const [assetCount, leaveCount, docCount, contract] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(hr_assets)
      .where(eq(hr_assets.assigned_to_employee_id, employeeId)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(hr_leaves)
      .where(and(eq(hr_leaves.employee_id, employeeId), eq(hr_leaves.status, "PENDING"))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(hr_documents)
      .where(eq(hr_documents.created_by_employee_id, employeeId)),
    db
      .select({
        id: hr_contracts.id,
        job_title: hr_contracts.job_title,
        status: hr_contracts.status,
        start_date: hr_contracts.start_date,
        end_date: hr_contracts.end_date,
      })
      .from(hr_contracts)
      .where(eq(hr_contracts.employee_ref_id, employeeId))
      .orderBy(desc(hr_contracts.start_date))
      .limit(1),
  ]);

  return {
    ...base,
    counts: {
      assets: assetCount[0]?.n ?? 0,
      open_leave: leaveCount[0]?.n ?? 0,
      documents: docCount[0]?.n ?? 0,
    },
    contract: contract[0] ?? null,
  };
}

/** The caller's own employee record plus account and roles — drives the self-service shell. */
export async function getMyEmployeeRecord(userId: number) {
  const employeeId = await employeeIdForUser(userId);
  if (!employeeId) {
    throw new AppError("No employee profile for this account", 404, "EMPLOYEE_PROFILE_MISSING");
  }

  const [detail, roleRows] = await Promise.all([
    getEmployeeDetail(userId, employeeId),
    db
      .select({ name: roles.name })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(user_roles.user_id, userId)),
  ]);

  return { ...detail, roles: roleRows.map((r) => r.name) };
}

/**
 * Link an employee to a `users` account, mirroring the merge script's precedence: an existing
 * account is linked and its password left alone; only a genuinely new person gets a row, with a
 * random placeholder hash so the invite flow sets the real one.
 */
export async function linkOrCreateUserForEmployee(
  tx: Parameters<Parameters<typeof withDbTransaction>[0]>[0],
  input: { email: string; first_name: string; last_name: string },
): Promise<{ userId: number; created: boolean }> {
  const email = input.email.toLowerCase();

  const [existing] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { userId: existing.id, created: false };

  const [employeeRole] = await tx.select().from(roles).where(eq(roles.name, "employee")).limit(1);
  if (!employeeRole) {
    throw new AppError("The 'employee' role is not seeded", 500, "ROLE_MISSING");
  }

  const [created] = await tx
    .insert(users)
    .values({
      email,
      name: `${input.first_name} ${input.last_name}`.trim(),
      role_id: employeeRole.id,
      password_hash: await hashPassword(randomBytes(24).toString("hex")),
      email_verified: false,
      is_active: true,
    })
    .returning();

  await tx
    .insert(user_roles)
    .values({ user_id: created.id, role_id: employeeRole.id })
    .onConflictDoNothing();

  return { userId: created.id, created: true };
}

/** Manual create for staff who predate REC-05. Future hires arrive through the offer flow. */
export async function createEmployee(input: CreateEmployeeInput) {
  const email = input.personal_email.toLowerCase();

  const [dup] = await db
    .select({ id: employees.id, first_name: employees.first_name, last_name: employees.last_name })
    .from(employees)
    .where(
      or(
        eq(employees.personal_email, email),
        input.work_email ? eq(employees.work_email, input.work_email.toLowerCase()) : sql`false`,
      ),
    )
    .limit(1);

  if (dup) {
    throw new AppError(
      `That email already belongs to ${dup.first_name} ${dup.last_name}`,
      409,
      "EMPLOYEE_EMAIL_TAKEN",
    );
  }

  return withDbTransaction(async (tx) => {
    const { userId } = await linkOrCreateUserForEmployee(tx, {
      email,
      first_name: input.first_name,
      last_name: input.last_name,
    });

    const [row] = await tx
      .insert(employees)
      .values({
        user_id: userId,
        first_name: input.first_name,
        last_name: input.last_name,
        personal_email: email,
        work_email: input.work_email?.toLowerCase() ?? null,
        employee_number: input.employee_number ?? null,
        job_title: input.job_title ?? null,
        department: input.department ?? null,
        employment_type: input.employment_type ?? "staff",
        manager_id: input.manager_id ?? null,
        hired_at: input.hired_at ?? null,
        phone: input.phone ?? null,
        status: "active",
      })
      .returning();

    return row;
  });
}

/** HR-side edit. Rejects self-editable keys and any status LCM-02 owns. */
export async function updateEmployeeAsHr(employeeId: string, patch: Record<string, unknown>) {
  assertFieldSet(patch, HR_EDITABLE_FIELDS, "HR");

  if (patch.status !== undefined) {
    if (!HR_SETTABLE_STATUSES.includes(patch.status as never)) {
      throw new AppError(
        `Status '${patch.status}' is set by the onboarding or offboarding process, not directly`,
        422,
        "STATUS_NOT_SETTABLE",
      );
    }
  }

  if (patch.manager_id === employeeId) {
    throw new AppError("An employee cannot manage themselves", 422, "SELF_MANAGED");
  }

  if (patch.work_email) {
    const [clash] = await db
      .select({ id: employees.id })
      .from(employees)
      .where(
        and(
          eq(employees.work_email, String(patch.work_email).toLowerCase()),
          ne(employees.id, employeeId),
        ),
      )
      .limit(1);
    if (clash) throw new AppError("That work email is already in use", 409, "EMAIL_TAKEN");
  }

  const [row] = await db
    .update(employees)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(employees.id, employeeId))
    .returning();

  if (!row) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  return row;
}

/** Self-service edit, restricted to the personal fields. */
export async function updateMyProfile(userId: number, patch: Record<string, unknown>) {
  assertFieldSet(patch, SELF_EDITABLE_FIELDS, "self");

  const employeeId = await employeeIdForUser(userId);
  if (!employeeId) {
    throw new AppError("No employee profile for this account", 404, "EMPLOYEE_PROFILE_MISSING");
  }

  const [row] = await db
    .update(employees)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(employees.id, employeeId))
    .returning();

  return row;
}

/** Distinct departments — powers the directory filter without a separate table. */
export async function listDepartments(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ department: employees.department })
    .from(employees)
    .where(sql`${employees.department} is not null`)
    .orderBy(asc(employees.department));
  return rows.map((r) => r.department!).filter(Boolean);
}
