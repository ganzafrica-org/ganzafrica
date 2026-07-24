import fs from "fs";
import path from "path";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_users } from "@/db/schema/hr/employee";
import { hr_policies } from "@/db/schema/hr/policy";
import { AppError } from "@/middlewares";

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

async function assertUserExists(userId: string): Promise<void> {
  const rows = await db
    .select({ id: hr_users.id })
    .from(hr_users)
    .where(eq(hr_users.id, userId))
    .limit(1);
  if (!rows.length) throw new AppError("Created by user not found", 404);
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
    createdById: p.created_by_id,
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
    createdById: p.created_by_id,
    modifiedAt: p.updated_at,
    createdAt: p.created_at,
  };
}

export async function createPolicy(input: CreatePolicyInput) {
  await assertUserExists(input.createdById);

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
      created_by_id: input.createdById,
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
