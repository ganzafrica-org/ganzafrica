import path from "path";
import { and, asc, desc, eq, ilike, inArray, isNull, ne, or } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { employees } from "@/db/schema/hr/employees";
import { requireEmployee, isManagerOf, type AccessContext } from "./employee-context";
import { hr_contracts } from "@/db/schema/hr/contract";
import { hr_documents } from "@/db/schema/hr/document";
import { hr_leaves } from "@/db/schema/hr/leave";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";
import { extractText } from "@/services/text-extraction.service";
import { getObjectBuffer, getPresignedDownload } from "@/services/storage.service";
import { DocumentACL, DocumentVersionEntry } from "@/types/hr";
import { Logger } from "@/config";

const logger = new Logger("DocumentService");

export type DocumentCategory =
  | "Contract Templates"
  | "Policies & Procedures"
  | "Forms & Applications"
  | "Training Materials"
  | "Compliance & Legal"
  | "Onboarding Materials"
  | "Leave Attachment";

export type DocumentStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export type DocumentAccessContext = AccessContext;

/** Metadata for a file already stored by the `privateUpload` middleware (multer-s3). */
export interface UploadedFile {
  key: string;
  size: number;
  originalName: string;
}

export interface ListDocumentsQuery {
  page: number;
  limit: number;
  category?: DocumentCategory;
  status?: DocumentStatus;
  search?: string;
  /** documents:manage callers only — filter to documents relevant to one employee. */
  employeeId?: string;
  sortBy?: "document_name" | "version" | "updatedAt" | "downloads";
  sortOrder?: "asc" | "desc";
}

export interface CreateDocumentInput {
  document_name: string;
  category: DocumentCategory;
  description: string;
  department: string;
  status?: DocumentStatus;
  file: UploadedFile;
  createdById: string;
  access?: DocumentACL;
  contractId?: string;
  leaveId?: string;
}

export interface UpdateDocumentInput {
  document_name?: string;
  category?: DocumentCategory;
  description?: string;
  department?: string;
  status?: DocumentStatus;
  file?: UploadedFile;
  access?: DocumentACL;
  contractId?: string;
}

const VALID_CATEGORIES: DocumentCategory[] = [
  "Contract Templates",
  "Policies & Procedures",
  "Forms & Applications",
  "Training Materials",
  "Compliance & Legal",
  "Onboarding Materials",
  "Leave Attachment",
];

function bytesToHuman(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  if (kb >= 1) return `${kb.toFixed(1)} KB`;
  return `${bytes} B`;
}

/**
 * Index a document's file text for search-in-file (DOC-plus). Best-effort and non-blocking:
 * extraction failures (unsupported type, scanned image with no OCR wired) leave the document
 * searchable by name/description only and never fail the upload.
 */
async function indexDocumentText(documentId: string, key: string, fileName: string) {
  const buffer = await getObjectBuffer(key);
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

async function assertLeaveExists(leaveId: string): Promise<void> {
  const rows = await db
    .select({ id: hr_leaves.id })
    .from(hr_leaves)
    .where(eq(hr_leaves.id, leaveId))
    .limit(1);
  if (!rows.length) throw new AppError("Linked leave request not found in DB", 404);
}

async function contractOwnerEmployeeId(contractId: string | null): Promise<string | null> {
  if (!contractId) return null;
  const [row] = await db
    .select({ employeeId: hr_contracts.employee_ref_id })
    .from(hr_contracts)
    .where(eq(hr_contracts.id, contractId))
    .limit(1);
  return row?.employeeId ?? null;
}

/** True when `ctxEmployeeId` owns the leave, or is anywhere in its owner's manager chain. */
async function leaveDocumentAccess(
  leaveId: string | null,
  ctxEmployeeId: string | null,
): Promise<boolean> {
  if (!leaveId || !ctxEmployeeId) return false;
  const [row] = await db
    .select({ employeeId: hr_leaves.employee_id })
    .from(hr_leaves)
    .where(eq(hr_leaves.id, leaveId))
    .limit(1);
  const ownerId = row?.employeeId ?? null;
  if (!ownerId) return false;
  if (ownerId === ctxEmployeeId) return true;
  return isManagerOf(ctxEmployeeId, ownerId);
}

export interface DocumentACLSubject {
  access: DocumentACL | null;
  /** The employee_ref_id of the linked contract, resolved by the caller (or null/undefined if none). */
  contractEmployeeId?: string | null;
  /**
   * True when this is a leave attachment (hr_documents.leave_id set) and the caller is either the
   * leave's own owner or their resolved approver (manager-chain) — resolved by the caller via
   * leaveDocumentAccess, since it needs an async isManagerOf walk this synchronous check can't do.
   */
  leaveAccess?: boolean;
}

/**
 * ACL enforcement: single source of truth for document access checks, used by both the list
 * filter and the download check.
 *
 * Rules (MOD-05 §3, frozen; leave attachments per punch-list #5):
 * - hr / admin roles -> always readable.
 * - Document linked to a contract owned by this employee -> always readable.
 * - Leave attachment owned by, or awaiting decision from, this employee -> always readable.
 * - ACL null/empty -> readable only by hr/admin (already handled above).
 * - Any-clause match on roles / employee_ids / departments -> readable.
 * - Otherwise -> not readable.
 */
export function canReadDocument(ctx: DocumentAccessContext, doc: DocumentACLSubject): boolean {
  if (ctx.roles.includes("hr") || ctx.roles.includes("admin")) return true;

  if (doc.contractEmployeeId && ctx.employeeId && doc.contractEmployeeId === ctx.employeeId) {
    return true;
  }

  if (doc.leaveAccess) return true;

  const acl = doc.access;
  if (!acl) return false;

  if (acl.roles?.some((role) => ctx.roles.includes(role.toLowerCase()))) return true;
  if (ctx.employeeId && acl.employee_ids?.includes(ctx.employeeId)) return true;
  if (ctx.department && acl.departments?.includes(ctx.department)) return true;

  return false;
}

type DocumentRow = typeof hr_documents.$inferSelect;

/**
 * Shared ACL-checked fetch: 404 if missing/archived, 403 if the ACL denies. Used by every read
 * path that touches the underlying file (download, view-url, content) so the check never drifts.
 * `executor` accepts either `db` or an open transaction — both expose the same `.select()` API.
 */
async function fetchReadableDocument(
  executor: Pick<typeof db, "select">,
  id: string,
  ctx: DocumentAccessContext,
): Promise<DocumentRow> {
  const rows = await executor.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);
  const doc = rows[0];
  if (doc.status === "ARCHIVED") throw new AppError("Document not found", 404);

  const contractEmployeeId = await contractOwnerEmployeeId(doc.contract_id);
  const leaveAccess = await leaveDocumentAccess(doc.leave_id, ctx.employeeId);
  if (
    !canReadDocument(ctx, { access: doc.access as DocumentACL, contractEmployeeId, leaveAccess })
  ) {
    throw new AppError("Access denied: you do not have permission to access this document", 403);
  }
  return doc;
}

function toListItem(p: DocumentRow, creatorMap: Map<string, string>) {
  return {
    id: p.id,
    document_name: p.document_name,
    category: p.category,
    version: p.version,
    description: p.description,
    department: p.department,
    fileSize: p.file_size,
    downloads: p.downloads,
    status: p.status,
    access: p.access as DocumentACL,
    contract_id: p.contract_id,
    modifiedAt: p.updated_at,
    createdBy: {
      id: p.created_by_employee_id,
      fullName: p.created_by_employee_id ? (creatorMap.get(p.created_by_employee_id) ?? "") : "",
    },
  };
}

async function creatorNameMap(rows: DocumentRow[]): Promise<Map<string, string>> {
  const creatorIds = [
    ...new Set(rows.map((p) => p.created_by_employee_id).filter((id): id is string => !!id)),
  ];
  if (!creatorIds.length) return new Map();
  const creators = await db
    .select({ id: employees.id, first: employees.first_name, last: employees.last_name })
    .from(employees)
    .where(inArray(employees.id, creatorIds));
  return new Map(creators.map((c) => [c.id, `${c.first} ${c.last}`]));
}

/** Contract owners for every contract_id present in `rows`, keyed by contract id. */
async function contractOwnerMap(rows: DocumentRow[]): Promise<Map<string, string>> {
  const contractIds = [
    ...new Set(rows.map((p) => p.contract_id).filter((id): id is string => !!id)),
  ];
  if (!contractIds.length) return new Map();
  const contracts = await db
    .select({ id: hr_contracts.id, employeeId: hr_contracts.employee_ref_id })
    .from(hr_contracts)
    .where(inArray(hr_contracts.id, contractIds));
  return new Map(contracts.filter((c) => c.employeeId).map((c) => [c.id, c.employeeId as string]));
}

export async function listDocuments(query: ListDocumentsQuery, ctx: DocumentAccessContext) {
  const conditions = [isNull(hr_documents.archived_at), ne(hr_documents.status, "ARCHIVED")];
  if (query.category) conditions.push(eq(hr_documents.category, query.category));
  if (query.status) conditions.push(eq(hr_documents.status, query.status));
  if (query.search) {
    const like = `%${query.search}%`;
    conditions.push(
      or(ilike(hr_documents.document_name, like), ilike(hr_documents.description, like))!,
    );
  }
  const whereClause = and(...conditions);

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

  const isManager = ctx.roles.includes("hr") || ctx.roles.includes("admin");

  // Non-managers only ever see what their own ACL admits; fine at this scale (internal HR tool,
  // not a high-volume document store) to filter in application code and paginate the result.
  const allRows = await db.select().from(hr_documents).where(whereClause).orderBy(order);
  const owners = await contractOwnerMap(allRows);

  let visible = isManager
    ? allRows
    : allRows.filter((row) =>
        canReadDocument(ctx, {
          access: row.access as DocumentACL,
          contractEmployeeId: row.contract_id ? (owners.get(row.contract_id) ?? null) : null,
        }),
      );

  if (isManager && query.employeeId) {
    visible = visible.filter((row) => {
      const acl = row.access as DocumentACL | null;
      const contractOwner = row.contract_id ? owners.get(row.contract_id) : undefined;
      return contractOwner === query.employeeId || acl?.employee_ids?.includes(query.employeeId!);
    });
  }

  const total = visible.length;
  const page = visible.slice((query.page - 1) * query.limit, query.page * query.limit);

  const creatorMap = await creatorNameMap(page);
  const data = page.map((p) => toListItem(p, creatorMap));

  return { data, total };
}

/** GET /hr/me/documents — ACL-admitted + own-contract docs for the authenticated employee. */
export async function listMyDocuments(
  ctx: DocumentAccessContext,
  paging: { page: number; limit: number },
) {
  const conditions = [isNull(hr_documents.archived_at), ne(hr_documents.status, "ARCHIVED")];
  const rows = await db
    .select()
    .from(hr_documents)
    .where(and(...conditions))
    .orderBy(desc(hr_documents.updated_at));

  const owners = await contractOwnerMap(rows);
  const visible = rows.filter((row) =>
    canReadDocument(ctx, {
      access: row.access as DocumentACL,
      contractEmployeeId: row.contract_id ? (owners.get(row.contract_id) ?? null) : null,
    }),
  );

  const total = visible.length;
  const page = visible.slice((paging.page - 1) * paging.limit, paging.page * paging.limit);
  const creatorMap = await creatorNameMap(page);
  const data = page.map((p) => toListItem(p, creatorMap));

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
export async function searchDocuments(query: SearchDocumentsQuery, ctx: DocumentAccessContext) {
  const q = query.q.trim();
  if (!q) return { data: [], total: 0 };
  const like = `%${q}%`;

  const match = or(
    ilike(hr_documents.document_name, like),
    ilike(hr_documents.description, like),
    ilike(hr_documents.extracted_text, like),
  );
  const whereClause = and(
    isNull(hr_documents.archived_at),
    ne(hr_documents.status, "ARCHIVED"),
    match,
  );

  const isManager = ctx.roles.includes("hr") || ctx.roles.includes("admin");
  const rows = await db
    .select()
    .from(hr_documents)
    .where(whereClause)
    .orderBy(desc(hr_documents.updated_at));

  const owners = await contractOwnerMap(rows);
  const visible = isManager
    ? rows
    : rows.filter((row) =>
        canReadDocument(ctx, {
          access: row.access as DocumentACL,
          contractEmployeeId: row.contract_id ? (owners.get(row.contract_id) ?? null) : null,
        }),
      );

  const total = visible.length;
  const page = visible.slice((query.page - 1) * query.limit, query.page * query.limit);

  const data = page.map((p) => ({
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

export async function getDocument(id: string, ctx: DocumentAccessContext) {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);
  const p = rows[0];

  const contractEmployeeId = await contractOwnerEmployeeId(p.contract_id);
  const leaveAccess = await leaveDocumentAccess(p.leave_id, ctx.employeeId);
  if (!canReadDocument(ctx, { access: p.access as DocumentACL, contractEmployeeId, leaveAccess })) {
    throw new AppError("Access denied: you do not have permission to view this document", 403);
  }

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
    fileSize: p.file_size,
    downloads: p.downloads,
    status: p.status,
    access: p.access as DocumentACL,
    versions: p.versions as DocumentVersionEntry[],
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

  if (input.category === "Contract Templates") {
    if (!input.contractId) {
      throw new AppError("Contract details must be linked. contractId is required.", 400);
    }
    await assertContractExists(input.contractId);
  }

  if (input.category === "Leave Attachment") {
    if (!input.leaveId) {
      throw new AppError("Leave request must be linked. leaveId is required.", 400);
    }
    await assertLeaveExists(input.leaveId);
  }
  const inserted = await db
    .insert(hr_documents)
    .values({
      document_name: input.document_name,
      category: input.category,
      version: "1",
      description: input.description,
      department: input.department,
      status: input.status ?? "PUBLISHED",
      file_path: input.file.key,
      file_size: bytesToHuman(input.file.size),
      downloads: 0,
      versions: [],
      created_by_employee_id: input.createdById,
      access: input.access ?? {},
      contract_id: input.category === "Contract Templates" ? input.contractId : null,
      leave_id: input.category === "Leave Attachment" ? input.leaveId : null,
    })
    .returning();

  if (!inserted.length) throw new AppError("Failed to create document", 400);

  // Index the file text out-of-band so a slow/large extraction never blocks the upload response.
  void indexDocumentText(inserted[0].id, input.file.key, input.file.originalName).catch((err) =>
    logger.warn("Document text indexing failed (non-fatal)", err as Error),
  );

  return inserted[0];
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);
  const existing = rows[0];

  if (input.category && !VALID_CATEGORIES.includes(input.category)) {
    throw new AppError("Invalid category type provided", 400);
  }

  if (input.contractId) {
    await assertContractExists(input.contractId);
  }

  const patch: Partial<typeof hr_documents.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.document_name !== undefined) patch.document_name = input.document_name;
  if (input.category !== undefined) patch.category = input.category;
  if (input.description !== undefined) patch.description = input.description;
  if (input.department !== undefined) patch.department = input.department;
  if (input.status !== undefined) patch.status = input.status;
  if (input.access !== undefined) patch.access = input.access;
  if (input.contractId !== undefined) patch.contract_id = input.contractId;

  // Versioning: a new file bumps `version` and appends the outgoing file to `versions` history.
  if (input.file) {
    const nextVersion = String((parseInt(existing.version, 10) || 0) + 1);
    const history = (existing.versions as DocumentVersionEntry[] | null) ?? [];
    const outgoing: DocumentVersionEntry = {
      key: existing.file_path,
      version: existing.version,
      uploaded_at: (existing.updated_at ?? existing.created_at).toISOString(),
    };
    patch.versions = [...history, outgoing];
    patch.file_path = input.file.key;
    patch.file_size = bytesToHuman(input.file.size);
    patch.version = nextVersion;
  }

  const updated = await db
    .update(hr_documents)
    .set(patch)
    .where(eq(hr_documents.id, id))
    .returning();

  if (!updated.length) throw new AppError("Document not found", 404);

  if (input.file) {
    void indexDocumentText(updated[0].id, input.file.key, input.file.originalName).catch((err) =>
      logger.warn("Document re-indexing failed (non-fatal)", err as Error),
    );
  }

  const wasPublished = existing.status === "PUBLISHED";
  const isNowPublished = updated[0].status === "PUBLISHED";

  if (!wasPublished && isNowPublished) {
    try {
      await sendNotification({
        type: "DOCUMENT_PUBLISHED",
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

/** Soft delete: status -> ARCHIVED. The file key is kept for audit; never hard-deleted. */
export async function deleteDocument(id: string): Promise<void> {
  const rows = await db.select().from(hr_documents).where(eq(hr_documents.id, id)).limit(1);
  if (!rows.length) throw new AppError("Document not found", 404);
  if (rows[0].status === "ARCHIVED") return; // idempotent

  await db
    .update(hr_documents)
    .set({ status: "ARCHIVED", updated_at: new Date() })
    .where(eq(hr_documents.id, id));
}

/**
 * ACL check + presigned download link. Single source of truth for the read check (shared with
 * listDocuments/listMyDocuments via canReadDocument), 5-minute expiry, increments `downloads`.
 */
export async function getDownloadUrl(
  id: string,
  ctx: DocumentAccessContext,
): Promise<{ url: string; fileName: string }> {
  return await withDbTransaction(async (tx) => {
    const doc = await fetchReadableDocument(tx, id, ctx);

    await tx
      .update(hr_documents)
      .set({ downloads: doc.downloads + 1, updated_at: new Date() })
      .where(eq(hr_documents.id, id));

    const url = await getPresignedDownload(doc.file_path, 300);
    return { url, fileName: doc.document_name };
  });
}

// Inline preview needs longer than a download link: the viewing session (an Office Online Viewer
// iframe, or just someone reading a long PDF) can run past 5 minutes without a re-fetch, but a
// fresh URL is minted every time the viewer mounts, so this never needs to reach the 7-day cap.
const VIEW_URL_EXPIRY_SECONDS = 15 * 60;
// Text/CSV preview reads the whole object into memory — cap it so a huge file can't blow up the
// request. Comfortably above any real policy/form document; larger files still download fine.
const MAX_INLINE_TEXT_BYTES = 2 * 1024 * 1024;

/**
 * ACL check + presigned URL for *inline viewing* (not a download): does not increment
 * `downloads`, and returns the real stored filename (the S3 key's basename) rather than the
 * user-facing document_name, since the caller needs the actual extension to pick a renderer.
 */
export async function getViewUrl(
  id: string,
  ctx: DocumentAccessContext,
): Promise<{ url: string; fileName: string }> {
  const doc = await fetchReadableDocument(db, id, ctx);
  const url = await getPresignedDownload(doc.file_path, VIEW_URL_EXPIRY_SECONDS);
  return { url, fileName: path.basename(doc.file_path) };
}

/**
 * ACL-checked raw text content for formats the frontend renders itself (csv/txt/json/xml/css/js)
 * rather than embedding. Goes through our own API (not a direct S3 fetch from the browser) so it
 * works regardless of whether the Spaces bucket has CORS configured for cross-origin `fetch()` —
 * <img>/<iframe>/<video> tags don't need CORS to load a URL, but reading a response body via JS
 * does, and DO Spaces buckets don't have CORS enabled by default.
 */
export async function getViewableText(
  id: string,
  ctx: DocumentAccessContext,
): Promise<{ text: string; fileName: string; truncated: boolean }> {
  const doc = await fetchReadableDocument(db, id, ctx);
  const buffer = await getObjectBuffer(doc.file_path);
  const truncated = buffer.length > MAX_INLINE_TEXT_BYTES;
  const text = buffer.subarray(0, MAX_INLINE_TEXT_BYTES).toString("utf-8");
  return { text, fileName: path.basename(doc.file_path), truncated };
}
