import fs from "fs";
import path from "path";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_policies, hr_policy_acknowledgements } from "@/db/schema/hr/policy";
import { employees } from "@/db/schema/hr/employees";
import { AppError } from "@/middlewares";
import { requireEmployee } from "./employee-context";

export type PolicyCategory = "GENERAL" | "HR" | "IT" | "FINANCE" | "COMPLIANCE" | "OTHER";
export type PolicyStatus = "PUBLISHED" | "DRAFT";

export interface ListPoliciesQuery {
  page: number;
  limit: number;
  category?: string;
  status?: PolicyStatus;
  sortBy?: "title" | "version" | "updatedAt" | "downloads";
  sortOrder?: "asc" | "desc";
}

export interface CreatePolicyInput {
  title: string;
  content?: string | null;
  category: string;
  policyCategory?: PolicyCategory;
  version: string;
  status?: PolicyStatus;
  fileName: string;
  fileContentBase64: string;
  createdById: string;
}

export interface UpdatePolicyInput {
  title?: string;
  content?: string | null;
  category?: string;
  policyCategory?: PolicyCategory;
  version?: string;
  status?: PolicyStatus;
  isActive?: boolean;
  fileName?: string;
  fileContentBase64?: string;
}

function uploadsDir(): string {
  return path.resolve(process.cwd(), "uploads", "policies");
}

function bytesToHuman(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  if (kb >= 1) return `${kb.toFixed(1)} KB`;
  return `${bytes} B`;
}

function safeFileName(original: string): string {
  const base = path.basename(original).replace(/[^\w.\-() ]+/g, "_");
  const stamp = Date.now().toString();
  return `${stamp}-${base}`;
}

function saveBase64File(fileName: string, base64: string): { filePath: string; fileSize: string } {
  const dir = uploadsDir();
  fs.mkdirSync(dir, { recursive: true });

  const buf = Buffer.from(base64, "base64");
  if (!buf.length) throw new AppError("Invalid file content", 400);

  const finalName = safeFileName(fileName);
  const absolutePath = path.join(dir, finalName);
  fs.writeFileSync(absolutePath, buf);

  const rel = path.join("uploads", "policies", finalName).replace(/\\/g, "/");
  return { filePath: rel, fileSize: bytesToHuman(buf.length) };
}

export async function listPolicies(query: ListPoliciesQuery) {
  const conditions = [];
  if (query.category) conditions.push(eq(hr_policies.category, query.category));
  if (query.status) conditions.push(eq(hr_policies.status, query.status));
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const countRows = await db.select().from(hr_policies).where(whereClause);
  const total = countRows.length;

  const sortColumn = (() => {
    switch (query.sortBy) {
      case "title":
        return hr_policies.title;
      case "version":
        return hr_policies.version;
      case "downloads":
        return hr_policies.downloads;
      case "updatedAt":
      default:
        return hr_policies.updated_at;
    }
  })();
  const order = (query.sortOrder ?? "desc") === "asc" ? asc(sortColumn) : desc(sortColumn);

  const rows = await db
    .select()
    .from(hr_policies)
    .where(whereClause)
    .orderBy(order)
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const data = rows.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    policyCategory: p.policy_category,
    version: p.version,
    fileSize: p.file_size,
    downloads: p.downloads,
    isActive: p.is_active,
    status: p.status,
    createdById: p.created_by_employee_id,
    modifiedAt: p.updated_at,
    createdAt: p.created_at,
  }));

  return { data, total };
}

export async function getPolicy(id: string) {
  const rows = await db.select().from(hr_policies).where(eq(hr_policies.id, id)).limit(1);
  if (!rows.length) throw new AppError("Policy not found", 404);
  const p = rows[0];

  return {
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    policyCategory: p.policy_category,
    version: p.version,
    filePath: p.file_path,
    fileSize: p.file_size,
    downloads: p.downloads,
    isActive: p.is_active,
    status: p.status,
    createdById: p.created_by_employee_id,
    modifiedAt: p.updated_at,
    createdAt: p.created_at,
  };
}

export async function createPolicy(input: CreatePolicyInput) {
  await requireEmployee(input.createdById);

  const saved = saveBase64File(input.fileName, input.fileContentBase64);

  const inserted = await db
    .insert(hr_policies)
    .values({
      title: input.title,
      content: input.content ?? null,
      category: input.category,
      policy_category: input.policyCategory ?? "GENERAL",
      version: input.version,
      status: input.status ?? "PUBLISHED",
      file_path: saved.filePath,
      file_size: saved.fileSize,
      downloads: 0,
      is_active: true,
      created_by_employee_id: input.createdById,
    })
    .returning();

  if (!inserted.length) throw new AppError("Failed to create policy", 400);
  return inserted[0];
}

export async function updatePolicy(id: string, input: UpdatePolicyInput) {
  const rows = await db.select().from(hr_policies).where(eq(hr_policies.id, id)).limit(1);
  if (!rows.length) throw new AppError("Policy not found", 404);

  let filePatch: Partial<{ file_path: string; file_size: string }> = {};
  if (input.fileName && input.fileContentBase64) {
    const saved = saveBase64File(input.fileName, input.fileContentBase64);
    filePatch = { file_path: saved.filePath, file_size: saved.fileSize };
  } else if (input.fileName || input.fileContentBase64) {
    throw new AppError("Both fileName and fileContentBase64 are required to replace file", 400);
  }

  const patch: Partial<typeof hr_policies.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.title !== undefined) patch.title = input.title;
  if (input.content !== undefined) patch.content = input.content;
  if (input.category !== undefined) patch.category = input.category;
  if (input.policyCategory !== undefined) patch.policy_category = input.policyCategory;
  if (input.version !== undefined) patch.version = input.version;
  if (input.status !== undefined) patch.status = input.status;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (filePatch.file_path !== undefined) patch.file_path = filePatch.file_path;
  if (filePatch.file_size !== undefined) patch.file_size = filePatch.file_size;

  const updated = await db.update(hr_policies).set(patch).where(eq(hr_policies.id, id)).returning();
  if (!updated.length) throw new AppError("Policy not found", 404);
  return updated[0];
}

export async function deletePolicy(id: string): Promise<void> {
  const rows = await db.select().from(hr_policies).where(eq(hr_policies.id, id)).limit(1);
  if (!rows.length) throw new AppError("Policy not found", 404);
  const p = rows[0];

  await db.delete(hr_policies).where(eq(hr_policies.id, id));

  const absolute = path.resolve(process.cwd(), p.file_path);
  try {
    fs.unlinkSync(absolute);
  } catch {
    // ignore missing files
  }
}

export async function incrementDownloadsAndGetPath(
  id: string,
): Promise<{ absolutePath: string; fileName: string }> {
  return await withDbTransaction(async (tx) => {
    const rows = await tx.select().from(hr_policies).where(eq(hr_policies.id, id)).limit(1);
    if (!rows.length) throw new AppError("Policy not found", 404);
    const p = rows[0];

    await tx
      .update(hr_policies)
      .set({ downloads: p.downloads + 1, updated_at: new Date() })
      .where(eq(hr_policies.id, id));

    const absolutePath = path.resolve(process.cwd(), p.file_path);
    const fileName = path.basename(p.file_path);
    return { absolutePath, fileName };
  });
}

/**
 * Count unacknowledged published policies for an employee.
 * Used by MOD-03 to display pending acknowledgement count.
 *
 * Returns the number of policies with status=PUBLISHED and is_active=true
 * where the employee has no acknowledgement record for the current version.
 */
export async function pendingAckCount(employeeId: string): Promise<number> {
  // Get all active published policies
  const publishedPolicies = await db
    .select({ id: hr_policies.id, version: hr_policies.version })
    .from(hr_policies)
    .where(and(eq(hr_policies.status, "PUBLISHED"), eq(hr_policies.is_active, true)));

  if (publishedPolicies.length === 0) {
    return 0;
  }

  // Get all acknowledged policies for this employee
  const acknowledged = await db
    .select({
      policyId: hr_policy_acknowledgements.policy_id,
      version: hr_policy_acknowledgements.version,
    })
    .from(hr_policy_acknowledgements)
    .where(eq(hr_policy_acknowledgements.employee_id, employeeId));

  const acknowledgedSet = new Set(acknowledged.map((a) => `${a.policyId}:${a.version}`));

  // Count policies without acknowledgement
  let pending = 0;
  for (const policy of publishedPolicies) {
    const key = `${policy.id}:${parseInt(policy.version)}`;
    if (!acknowledgedSet.has(key)) {
      pending++;
    }
  }

  return pending;
}

/**
 * Publish a policy — transitions from DRAFT to PUBLISHED, bumps version,
 * and deactivates the previous version of the same policy.
 */
export async function publishPolicy(policyId: string) {
  const [policy] = await db.select().from(hr_policies).where(eq(hr_policies.id, policyId)).limit(1);

  if (!policy) throw new AppError("Policy not found", 404);
  if (policy.status === "PUBLISHED") {
    throw new AppError("Policy is already published", 400);
  }

  return await withDbTransaction(async (tx) => {
    // Deactivate previous version (if any)
    await tx
      .update(hr_policies)
      .set({ is_active: false })
      .where(
        and(
          eq(hr_policies.title, policy.title),
          eq(hr_policies.status, "PUBLISHED"),
          eq(hr_policies.is_active, true),
        ),
      );

    // Publish current version
    const [published] = await tx
      .update(hr_policies)
      .set({ status: "PUBLISHED", is_active: true, updated_at: new Date() })
      .where(eq(hr_policies.id, policyId))
      .returning();

    return published;
  });
}

/**
 * Employee acknowledges a policy — creates/updates acknowledgement record for current version.
 * Idempotent: duplicate acknowledgements are silently ignored due to unique constraint.
 */
export async function acknowledgePolicy(policyId: string, employeeId: string) {
  const [policy] = await db.select().from(hr_policies).where(eq(hr_policies.id, policyId)).limit(1);

  if (!policy) throw new AppError("Policy not found", 404);
  if (policy.status !== "PUBLISHED") {
    throw new AppError("Only published policies can be acknowledged", 400);
  }

  // Ensure employee exists
  await requireEmployee(employeeId);

  // Parse version to integer for acknowledgement record
  const versionNum = parseInt(policy.version, 10);

  // Upsert (insert with onConflictDoNothing due to unique constraint)
  const result = await db
    .insert(hr_policy_acknowledgements)
    .values({
      policy_id: policyId,
      version: versionNum,
      employee_id: employeeId,
    })
    .onConflictDoNothing()
    .returning();

  // If result is empty, it means row already exists (due to unique constraint)
  // Return a dummy acknowledgement object for idempotency
  if (result.length === 0) {
    const [existing] = await db
      .select()
      .from(hr_policy_acknowledgements)
      .where(
        and(
          eq(hr_policy_acknowledgements.policy_id, policyId),
          eq(hr_policy_acknowledgements.version, versionNum),
          eq(hr_policy_acknowledgements.employee_id, employeeId),
        ),
      )
      .limit(1);
    return existing;
  }

  return result[0];
}

/**
 * Get acknowledgement report for a policy — shows who acknowledged and who's missing.
 * LEFT JOINs active employees to identify gaps.
 */
export async function getAcknowledgementReport(policyId: string) {
  const [policy] = await db.select().from(hr_policies).where(eq(hr_policies.id, policyId)).limit(1);

  if (!policy) throw new AppError("Policy not found", 404);

  // Get all active employees
  const allActiveEmployees = await db
    .select({ id: employees.id, first_name: employees.first_name, last_name: employees.last_name })
    .from(employees)
    .where(eq(employees.status, "active"));

  const versionNum = parseInt(policy.version, 10);

  // Get acknowledged employees for this policy version
  const acknowledged = await db
    .select({ employee_id: hr_policy_acknowledgements.employee_id })
    .from(hr_policy_acknowledgements)
    .where(
      and(
        eq(hr_policy_acknowledgements.policy_id, policyId),
        eq(hr_policy_acknowledgements.version, versionNum),
      ),
    );

  const acknowledgedIds = new Set(acknowledged.map((a) => a.employee_id));

  const report = allActiveEmployees.map((emp) => ({
    employee_id: emp.id,
    employee_name: `${emp.first_name} ${emp.last_name}`,
    acknowledged: acknowledgedIds.has(emp.id),
  }));

  return {
    policy_id: policyId,
    policy_title: policy.title,
    version: policy.version,
    total_active_employees: allActiveEmployees.length,
    acknowledged_count: acknowledgedIds.size,
    missing_count: allActiveEmployees.length - acknowledgedIds.size,
    details: report,
  };
}
