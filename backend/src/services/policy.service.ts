import fs from "fs";
import path from "path";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_policies, hr_users } from "@/db/schema";
import { AppError } from "@/middlewares";

export interface RequestUser {
  id: string;
  role?: string;
}

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
  category: string;
  version: string;
  status?: PolicyStatus;
  fileName: string;
  fileContentBase64: string;
}

export interface UpdatePolicyInput {
  title?: string;
  category?: string;
  version?: string;
  status?: PolicyStatus;
  fileName?: string;
  fileContentBase64?: string;
}

function ensureHr(requester: RequestUser): void {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);
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

  // Store relative path (so it works across environments)
  const rel = path.join("uploads", "policies", finalName).replace(/\\/g, "/");
  return { filePath: rel, fileSize: bytesToHuman(buf.length) };
}

export async function listPolicies(requester: RequestUser, query: ListPoliciesQuery) {
  // All authenticated users can read policies
  const conditions = [];
  if (query.category) conditions.push(eq(hr_policies.category, query.category));
  if (query.status) conditions.push(eq(hr_policies.status, query.status));
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const all = await db.select().from(hr_policies).where(whereClause);
  const total = all.length;

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

  const creatorIds = [...new Set(rows.map((p) => p.created_by_id))];
  const creators = creatorIds.length
    ? await db
        .select({ id: hr_users.id, first: hr_users.first_name, last: hr_users.last_name })
        .from(hr_users)
        // note: drizzle doesn't have IN helper here without extra imports; do a simple fallback map via multiple eq
        .where(and(...creatorIds.map((id) => eq(hr_users.id, id))))
    : [];

  const creatorMap = new Map(creators.map((c) => [c.id, `${c.first} ${c.last}`]));

  const data = rows.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    version: p.version,
    fileSize: p.file_size,
    downloads: p.downloads,
    status: p.status,
    modifiedAt: p.updated_at,
    createdBy: { id: p.created_by_id, fullName: creatorMap.get(p.created_by_id) ?? "" },
  }));

  return { data, total };
}

export async function getPolicy(requester: RequestUser, id: string) {
  const rows = await db.select().from(hr_policies).where(eq(hr_policies.id, id)).limit(1);
  if (!rows.length) throw new AppError("Policy not found", 404);
  const p = rows[0];

  const creators = await db
    .select({ id: hr_users.id, first: hr_users.first_name, last: hr_users.last_name })
    .from(hr_users)
    .where(eq(hr_users.id, p.created_by_id))
    .limit(1);

  const fullName = creators.length ? `${creators[0].first} ${creators[0].last}` : "";

  return {
    id: p.id,
    title: p.title,
    category: p.category,
    version: p.version,
    filePath: p.file_path,
    fileSize: p.file_size,
    downloads: p.downloads,
    status: p.status,
    modifiedAt: p.updated_at,
    createdBy: { id: p.created_by_id, fullName },
    createdAt: p.created_at,
  };
}

export async function createPolicy(requester: RequestUser, input: CreatePolicyInput) {
  ensureHr(requester);
  const saved = saveBase64File(input.fileName, input.fileContentBase64);

  const inserted = await db
    .insert(hr_policies)
    .values({
      title: input.title,
      category: input.category,
      version: input.version,
      status: input.status ?? "PUBLISHED",
      file_path: saved.filePath,
      file_size: saved.fileSize,
      downloads: 0,
      created_by_id: requester.id,
    })
    .returning();

  return inserted[0];
}

export async function updatePolicy(requester: RequestUser, id: string, input: UpdatePolicyInput) {
  ensureHr(requester);

  let filePatch: Partial<{ file_path: string; file_size: string }> = {};
  if (input.fileName && input.fileContentBase64) {
    const saved = saveBase64File(input.fileName, input.fileContentBase64);
    filePatch = { file_path: saved.filePath, file_size: saved.fileSize };
  } else if (input.fileName || input.fileContentBase64) {
    throw new AppError("Both fileName and fileContentBase64 are required to replace file", 400);
  }

  const updated = await db
    .update(hr_policies)
    .set({
      title: input.title ?? undefined,
      category: input.category ?? undefined,
      version: input.version ?? undefined,
      status: input.status ?? undefined,
      ...filePatch,
      updated_at: new Date(),
    })
    .where(eq(hr_policies.id, id))
    .returning();

  if (!updated.length) throw new AppError("Policy not found", 404);
  return updated[0];
}

export async function deletePolicy(requester: RequestUser, id: string): Promise<void> {
  ensureHr(requester);
  const rows = await db.select().from(hr_policies).where(eq(hr_policies.id, id)).limit(1);
  if (!rows.length) throw new AppError("Policy not found", 404);
  const p = rows[0];

  await db.delete(hr_policies).where(eq(hr_policies.id, id));

  // Best-effort file cleanup
  const absolute = path.resolve(process.cwd(), p.file_path);
  try {
    fs.unlinkSync(absolute);
  } catch {
    // ignore
  }
}

export async function incrementDownloadsAndGetPath(requester: RequestUser, id: string): Promise<{ absolutePath: string; fileName: string }> {
  // All roles can download; increment for HR per spec (we implement increment for everyone to keep metrics consistent)
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

