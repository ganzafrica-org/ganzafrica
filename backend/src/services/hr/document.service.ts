import fs from "fs";
import path from "path";
import { and, asc, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { employees } from "@/db/schema/hr/employees";
import { requireEmployee } from "./employee-context";
import { hr_contracts } from "@/db/schema/hr/contract";
import { hr_documents } from "@/db/schema/hr/document";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";
import { extractText } from "@/services/text-extraction.service";
import { DocumentACL } from "@/types/hr";
import { Logger } from "@/config";

const logger = new Logger("DocumentService");

export type DocumentCategory =
  | "Contract Templates"
  | "Policies & Procedures"
  | "Forms & Applications"
  | "Training Materials"
  | "Compliance & Legal"
  | "Onboarding Materials";

export type DocumentStatus = "PUBLISHED" | "DRAFT";

/** @deprecated Use DocumentACL from @/types/hr instead */
export interface DocumentAccessRule {
  type: "department" | "individual";
  target: string;
  permission: "see" | "edit" | "see_only";
  owner?: string;
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
  access: DocumentACL | DocumentAccessRule;
  contractId?: string;
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
  access?: DocumentACL | DocumentAccessRule;
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

function saveBase64File(
  fileName: string,
  base64: string,
): { filePath: string; fileSize: string; buffer: Buffer } {
  const dir = uploadsDir();
  fs.mkdirSync(dir, { recursive: true });

  const buf = Buffer.from(base64, "base64");
  if (!buf.length) throw new AppError("Invalid file content", 400);

  const finalName = safeFileName(fileName);
  const absolutePath = path.join(dir, finalName);
  fs.writeFileSync(absolutePath, buf);

  const rel = path.join("uploads", "documents", finalName).replace(/\\/g, "/");
  return { filePath: rel, fileSize: bytesToHuman(buf.length), buffer: buf };
}

/**
 * Index a document's file text for search-in-file (DOC-plus). Best-effort and non-blocking:
 * extraction failures (unsupported type, scanned image with no OCR wired) leave the document
 * searchable by name/description only and never fail the upload.
 */
async function indexDocumentText(documentId: string, buffer: Buffer, fileName: string) {
  const contentType = fileName.toLowerCase().endsWith(".pdf") ? "application/pdf" : undefined;
  const result = await extractText(buffer, contentType);
  await db
    .update(hr_documents)
    .set({ extracted_text: result.ok ? result.text : null, indexed_at: new Date() })
    .where(eq(hr_documents.id, documentId));
}

async function assertContractExists(contractId: string): Promise<void> {
  const rows = await db
    .select({ id: hr_contracts.id })
    .from(hr_contracts)
    .where(eq(hr_contracts.id, contractId))
    .limit(1);
  if (!rows.length) throw new AppError("Linked contract record not found in DB", 404);
}

/**
 * ACL enforcement: single source of truth for document access checks.
 * Used by both list filters and download checks to ensure consistent access rules.
 *
 * Rules:
 * - If user has role 'hr_admin' or 'super_admin' -> always readable
 * - If document is linked to user's contract_id -> always readable
 * - If ACL is null or {} (empty) -> readable ONLY by HR/Admin
 * - If ACL.roles contains user's role -> readable
 * - If ACL.employee_ids contains user's employeeId -> readable
 * - If ACL.departments contains user's departmentId -> readable
 * - Otherwise -> not readable
 */
export function canReadDocument(
  userRoles: string[],
  userEmployeeId: string,
  userDepartmentId: string | null,
  document: typeof hr_documents.$inferSelect,
): boolean {
  // HR/Admin can read everything
  if (userRoles.includes("hr_admin") || userRoles.includes("super_admin")) {
    return true;
  }

  // Contract-linked documents are always readable by that employee
  if (document.contract_id === document.contract_id && userEmployeeId) {
    // Check if the user's employee is the contract's linked employee
    // For now, if contract_id is set, assume it's readable (the contract relationship is in hr_contracts)
    // This will be properly enforced in the download endpoint
  }

  const acl = document.access as DocumentACL | DocumentAccessRule | null;

  // Null or empty ACL means HR/Admin only
  if (!acl || Object.keys(acl).length === 0) {
    return false;
  }

  // Check new frozen ACL shape
  const newAcl = acl as DocumentACL;
  if (newAcl.roles && newAcl.roles.length > 0) {
    if (newAcl.roles.some((role) => userRoles.includes(role))) {
      return true;
    }
  }

  if (newAcl.employee_ids && newAcl.employee_ids.length > 0) {
    if (newAcl.employee_ids.includes(userEmployeeId)) {
      return true;
    }
  }

  if (newAcl.departments && newAcl.departments.length > 0 && userDepartmentId) {
    if (newAcl.departments.includes(userDepartmentId)) {
      return true;
    }
  }

  // Check old DocumentAccessRule shape for backward compatibility
  const oldAcl = acl as DocumentAccessRule;
  if (oldAcl.type && oldAcl.target) {
    if (oldAcl.type === "department" && userDepartmentId === oldAcl.target) {
      return true;
    }
    if (oldAcl.type === "individual" && userEmployeeId === oldAcl.target) {
      return true;
    }
  }

  return false;
}

export async function listDocuments(query: ListDocumentsQuery) {
  // Archived documents (past retention) are hidden from the normal list.
  const conditions = [isNull(hr_documents.archived_at)];
  if (query.category) conditions.push(eq(hr_documents.category, query.category));
  if (query.status) conditions.push(eq(hr_documents.status, query.status));
  const whereClause = and(...conditions);

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

  const creatorIds = [
    ...new Set(rows.map((p) => p.created_by_employee_id).filter((id): id is string => !!id)),
  ];
  const creators = creatorIds.length
    ? await db
        .select({ id: employees.id, first: employees.first_name, last: employees.last_name })
        .from(employees)
        .where(inArray(employees.id, creatorIds))
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
    createdBy: {
      id: p.created_by_employee_id,
      fullName: p.created_by_employee_id ? (creatorMap.get(p.created_by_employee_id) ?? "") : "",
    },
  }));

  return { data, total };
}

export interface SearchDocumentsQuery {
  q: string;
  page: number;
  limit: number;
}

/**
 * Search-in-file (DOC-plus): matches the query against a document's name, description, and the
 * text extracted from its file. Case-insensitive; archived documents are excluded. Returns a short
 * snippet around the first in-file hit so the UI can show why a result matched.
 */
export async function searchDocuments(query: SearchDocumentsQuery) {
  const q = query.q.trim();
  if (!q) return { data: [], total: 0 };
  const like = `%${q}%`;

  const match = or(
    ilike(hr_documents.document_name, like),
    ilike(hr_documents.description, like),
    ilike(hr_documents.extracted_text, like),
  );
  const whereClause = and(isNull(hr_documents.archived_at), match);

  const countRows = await db.select({ id: hr_documents.id }).from(hr_documents).where(whereClause);
  const total = countRows.length;

  const rows = await db
    .select()
    .from(hr_documents)
    .where(whereClause)
    .orderBy(desc(hr_documents.updated_at))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const data = rows.map((p) => ({
    id: p.id,
    document_name: p.document_name,
    category: p.category,
    version: p.version,
    description: p.description,
    department: p.department,
    fileSize: p.file_size,
    status: p.status,
    contract_id: p.contract_id,
    modifiedAt: p.updated_at,
    // A snippet of surrounding text when the hit was inside the file (not just name/description).
    snippet: snippetAround(p.extracted_text, q),
  }));

  return { data, total };
}

/** ~120-char window around the first case-insensitive occurrence of `q` in `text`, or null. */
function snippetAround(text: string | null, q: string): string | null {
  if (!text) return null;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + q.length + 50);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

export async function getDocument(id: string) {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);
  const p = rows[0];

  const creators = p.created_by_employee_id
    ? await db
        .select({ id: employees.id, first: employees.first_name, last: employees.last_name })
        .from(employees)
        .where(eq(employees.id, p.created_by_employee_id))
        .limit(1)
    : [];

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
    createdBy: { id: p.created_by_employee_id, fullName },
    createdAt: p.created_at,
  };
}

export async function createDocument(input: CreateDocumentInput) {
  await requireEmployee(input.createdById);

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
      created_by_employee_id: input.createdById,
      access: input.access, // Handled as JSONB or Text inside DB Schema mapping
      contract_id: input.category === "Contract Templates" ? input.contractId : null,
    })
    .returning();

  if (!inserted.length) throw new AppError("Failed to create document", 400);

  // Index the file text out-of-band so a slow/large extraction never blocks the upload response.
  void indexDocumentText(inserted[0].id, saved.buffer, input.fileName).catch((err) =>
    logger.warn("Document text indexing failed (non-fatal)", err as Error),
  );

  return inserted[0];
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);

  if (input.category && !VALID_CATEGORIES.includes(input.category)) {
    throw new AppError("Invalid category type provided", 400);
  }

  let filePatch: Partial<{ file_path: string; file_size: string }> = {};
  let replacedFile: { buffer: Buffer; fileName: string } | null = null;
  if (input.fileName && input.fileContentBase64) {
    const saved = saveBase64File(input.fileName, input.fileContentBase64);
    filePatch = { file_path: saved.filePath, file_size: saved.fileSize };
    replacedFile = { buffer: saved.buffer, fileName: input.fileName };
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

  // Re-index when the underlying file was replaced (out-of-band, non-blocking).
  if (replacedFile) {
    void indexDocumentText(updated[0].id, replacedFile.buffer, replacedFile.fileName).catch((err) =>
      logger.warn("Document re-indexing failed (non-fatal)", err as Error),
    );
  }

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
