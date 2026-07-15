import fs from "fs";
import path from "path";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_users } from "@/db/schema/hr/employee";
import { hr_contracts } from "@/db/schema/hr/contract";
import { hr_documents } from "@/db/schema/hr/document";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";

export type DocumentCategory =
  | "Contract Templates"
  | "Policies & Procedures"
  | "Forms & Applications"
  | "Training Materials"
  | "Compliance & Legal"
  | "Onboarding Materials";

export type DocumentStatus = "PUBLISHED" | "DRAFT";

export interface DocumentAccessRule {
  type: "department" | "individual";
  target: string; // department name or user_id
  permission: "see" | "edit" | "see_only";
  owner?: string; // Specific value in case category is 'Contract Templates'
}

export interface ListDocumentsQuery {
  page: number;
  limit: number;
  category?: DocumentCategory;
  status?: DocumentStatus;
  sortBy?: "document_name" | "version" | "updatedAt" | "downloads";
  sortOrder?: "asc" | "desc";
}

export interface CreateDocumentInput {
  document_name: string;
  category: DocumentCategory;
  version: string;
  description: string;
  department: string;
  status?: DocumentStatus;
  fileName: string;
  fileContentBase64: string;
  createdById: string;
  access: DocumentAccessRule;
  contractId?: string; // Optional Foreign Key link to hr_contracts
}

export interface UpdateDocumentInput {
  document_name?: string;
  category?: DocumentCategory;
  version?: string;
  description?: string;
  department?: string;
  status?: DocumentStatus;
  fileName?: string;
  fileContentBase64?: string;
  access?: DocumentAccessRule;
  contractId?: string;
}

const VALID_CATEGORIES: DocumentCategory[] = [
  "Contract Templates",
  "Policies & Procedures",
  "Forms & Applications",
  "Training Materials",
  "Compliance & Legal",
  "Onboarding Materials",
];

function uploadsDir(): string {
  return path.resolve(process.cwd(), "uploads", "documents");
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

  const rel = path.join("uploads", "documents", finalName).replace(/\\/g, "/");
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

async function assertContractExists(contractId: string): Promise<void> {
  const rows = await db
    .select({ id: hr_contracts.id })
    .from(hr_contracts)
    .where(eq(hr_contracts.id, contractId))
    .limit(1);
  if (!rows.length) throw new AppError("Linked contract record not found in DB", 404);
}

export async function listDocuments(query: ListDocumentsQuery) {
  const conditions = [];
  if (query.category) conditions.push(eq(hr_documents.category, query.category));
  if (query.status) conditions.push(eq(hr_documents.status, query.status));
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const countRows = await db.select().from(hr_documents).where(whereClause);
  const total = countRows.length;

  const sortColumn = (() => {
    switch (query.sortBy) {
      case "document_name":
        return hr_documents.document_name;
      case "version":
        return hr_documents.version;
      case "downloads":
        return hr_documents.downloads;
      case "updatedAt":
      default:
        return hr_documents.updated_at;
    }
  })();
  const order = (query.sortOrder ?? "desc") === "asc" ? asc(sortColumn) : desc(sortColumn);

  const rows = await db
    .select()
    .from(hr_documents)
    .where(whereClause)
    .orderBy(order)
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const creatorIds = [...new Set(rows.map((p) => p.created_by_id))];
  const creators = creatorIds.length
    ? await db
        .select({ id: hr_users.id, first: hr_users.first_name, last: hr_users.last_name })
        .from(hr_users)
        .where(and(...creatorIds.map((id) => eq(hr_users.id, id))))
    : [];

  const creatorMap = new Map(creators.map((c) => [c.id, `${c.first} ${c.last}`]));

  const data = rows.map((p) => ({
    id: p.id,
    document_name: p.document_name,
    category: p.category,
    version: p.version,
    description: p.description,
    department: p.department,
    fileSize: p.file_size,
    downloads: p.downloads,
    status: p.status,
    access: p.access as DocumentAccessRule,
    contract_id: p.contract_id,
    modifiedAt: p.updated_at,
    createdBy: { id: p.created_by_id, fullName: creatorMap.get(p.created_by_id) ?? "" },
  }));

  return { data, total };
}

export async function getDocument(id: string) {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);
  const p = rows[0];

  const creators = await db
    .select({ id: hr_users.id, first: hr_users.first_name, last: hr_users.last_name })
    .from(hr_users)
    .where(eq(hr_users.id, p.created_by_id))
    .limit(1);

  const fullName = creators.length ? `${creators[0].first} ${creators[0].last}` : "";

  return {
    id: p.id,
    document_name: p.document_name,
    category: p.category,
    version: p.version,
    description: p.description,
    department: p.department,
    filePath: p.file_path,
    fileSize: p.file_size,
    downloads: p.downloads,
    status: p.status,
    access: p.access as DocumentAccessRule,
    contract_id: p.contract_id,
    modifiedAt: p.updated_at,
    createdBy: { id: p.created_by_id, fullName },
    createdAt: p.created_at,
  };
}

export async function createDocument(input: CreateDocumentInput) {
  await assertUserExists(input.createdById);

  if (!VALID_CATEGORIES.includes(input.category)) {
    throw new AppError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`, 400);
  }

  // Verification requirements specifically for Contracts
  if (input.category === "Contract Templates") {
    if (!input.access?.owner) {
      throw new AppError("Contracts must specify an owner in the access configuration.", 400);
    }
    if (!input.contractId) {
      throw new AppError("Contract details must be linked. contractId is required.", 400);
    }
    await assertContractExists(input.contractId);
  }

  const saved = saveBase64File(input.fileName, input.fileContentBase64);

  const inserted = await db
    .insert(hr_documents)
    .values({
      document_name: input.document_name,
      category: input.category,
      version: input.version,
      description: input.description,
      department: input.department,
      status: input.status ?? "PUBLISHED",
      file_path: saved.filePath,
      file_size: saved.fileSize,
      downloads: 0,
      created_by_id: input.createdById,
      access: input.access, // Handled as JSONB or Text inside DB Schema mapping
      contract_id: input.category === "Contract Templates" ? input.contractId : null,
    })
    .returning();

  if (!inserted.length) throw new AppError("Failed to create document", 400);
  return inserted[0];
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);

  if (input.category && !VALID_CATEGORIES.includes(input.category)) {
    throw new AppError("Invalid category type provided", 400);
  }

  let filePatch: Partial<{ file_path: string; file_size: string }> = {};
  if (input.fileName && input.fileContentBase64) {
    const saved = saveBase64File(input.fileName, input.fileContentBase64);
    filePatch = { file_path: saved.filePath, file_size: saved.fileSize };
  } else if (input.fileName || input.fileContentBase64) {
    throw new AppError("Both fileName and fileContentBase64 are required to replace file", 400);
  }

  if (input.contractId) {
    await assertContractExists(input.contractId);
  }

  const patch: Partial<typeof hr_documents.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.document_name !== undefined) patch.document_name = input.document_name;
  if (input.category !== undefined) patch.category = input.category;
  if (input.version !== undefined) patch.version = input.version;
  if (input.description !== undefined) patch.description = input.description;
  if (input.department !== undefined) patch.department = input.department;
  if (input.status !== undefined) patch.status = input.status;
  if (input.access !== undefined) patch.access = input.access;
  if (input.contractId !== undefined) patch.contract_id = input.contractId;
  if (filePatch.file_path !== undefined) patch.file_path = filePatch.file_path;
  if (filePatch.file_size !== undefined) patch.file_size = filePatch.file_size;

  const updated = await db
    .update(hr_documents)
    .set(patch)
    .where(eq(hr_documents.id, id))
    .returning();

  if (!updated.length) throw new AppError("Document not found", 404);

  const wasPublished = rows[0].status === "PUBLISHED";
  const isNowPublished = updated[0].status === "PUBLISHED";

  if (!wasPublished && isNowPublished) {
    try {
      await sendNotification({
        type: "DOCUMENT_PUBLISHED", // Retained for compatibility with notification engine
        triggeredBy: 0,
        relatedEntity: { documentId: updated[0].id },
        title: "New document published",
        message: `Document "${updated[0].document_name}" is now active.`,
        priority: "HIGH",
      });
    } catch {
      // notification failure must not break main operation flow
    }
  }

  return updated[0];
}

export async function deleteDocument(id: string): Promise<void> {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);
  const p = rows[0];

  await db.delete(hr_documents).where(eq(hr_documents.id, id));

  const absolute = path.resolve(process.cwd(), p.file_path);
  try {
    fs.unlinkSync(absolute);
  } catch {
    // catch missing files gracefully
  }
}

export async function incrementDownloadsAndGetPath(
  id: string,
): Promise<{ absolutePath: string; fileName: string }> {
  return await withDbTransaction(async (tx) => {
    const rows = await tx.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
    if (!rows.length) throw new AppError("Document not found", 404);
    const p = rows[0];

    await tx
      .update(hr_documents)
      .set({ downloads: p.downloads + 1, updated_at: new Date() })
      .where(eq(hr_documents.id, id));

    const absolutePath = path.resolve(process.cwd(), p.file_path);
    const fileName = path.basename(p.file_path);
    return { absolutePath, fileName };
  });
}
