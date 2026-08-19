import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import { getEmployeeForUser, getAccessContext } from "@/services/hr/employee-context";
import * as documentService from "../../services/hr/document.service";
import * as retentionService from "../../services/hr/document-retention.service";
import { AppError } from "@/middlewares";

/** multer-s3 augments the uploaded file with `location`/`key` (not part of Express.Multer.File). */
function uploadedFile(req: Request): documentService.UploadedFile | undefined {
  const file = req.file as unknown as { key?: string; size?: number; originalname?: string };
  if (!file?.key) return undefined;
  return { key: file.key, size: file.size ?? 0, originalName: file.originalname ?? file.key };
}

/**
 * `access` travels as a JSON-stringified form field over multipart/form-data (see
 * documentsService.toFormData on the frontend). The `validate` middleware's Zod schema parses
 * and shape-checks that string for a good error message, but it validates a throwaway payload
 * object and never writes the parsed result back onto `req.body` — so by the time it reaches
 * here `req.body.access` is still the raw string. Parse it for real before it hits the service,
 * otherwise a stringified ACL gets written straight into the jsonb column and `canReadDocument`
 * silently treats it as empty (no `.roles`/`.employee_ids`/`.departments` on a string).
 */
function parseAccessField(raw: unknown): documentService.CreateDocumentInput["access"] {
  if (raw === undefined || raw === null || raw === "") return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw as documentService.CreateDocumentInput["access"];
}

async function accessContext(req: Request) {
  return getAccessContext(Number(req.user!.id), req.user?.roles ?? []);
}

export const listDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ctx = await accessContext(req);
    const q = req.query as unknown as Record<string, string | undefined>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await documentService.listDocuments(
      {
        page,
        limit,
        category: q.category as documentService.DocumentCategory | undefined,
        status: q.status as documentService.DocumentStatus | undefined,
        search: q.search,
        employeeId: q.employee,
        sortBy: q.sortBy as documentService.ListDocumentsQuery["sortBy"],
        sortOrder: (q.sortOrder as "asc" | "desc" | undefined) ?? "desc",
      },
      ctx,
    );

    sendResponse(res, {
      success: true,
      message: "Documents fetched successfully",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const listMyDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ctx = await accessContext(req);
    const q = req.query as unknown as Record<string, string | undefined>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await documentService.listMyDocuments(ctx, { page, limit });

    sendResponse(res, {
      success: true,
      message: "Your documents fetched successfully",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const searchDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ctx = await accessContext(req);
    const q = req.query as unknown as Record<string, string | undefined>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await documentService.searchDocuments(
      { q: q.q ?? "", page, limit },
      ctx,
    );

    sendResponse(res, {
      success: true,
      message: "Document search completed",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const previewRetention = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { due, count } = await retentionService.previewRetention();
    sendResponse(res, {
      success: true,
      message: "Retention preview generated",
      data: due,
      meta: { total: count, page: 1, limit: count, totalPages: 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const setRetention = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const raw = (req.body as { retain_until?: string | null }).retain_until;
    // undefined → derive from category default; null → clear; string → explicit date.
    const retainUntil = raw === undefined ? undefined : raw === null ? null : new Date(raw);
    const result = await retentionService.setRetention(id, retainUntil);
    sendResponse(res, {
      success: true,
      message: "Retention updated",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ctx = await accessContext(req);
    const document = await documentService.getDocument(req.params.id, ctx);
    sendResponse(res, { success: true, message: "Document details retrieved", data: document });
  } catch (err) {
    next(err);
  }
};

export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const file = uploadedFile(req);
    if (!file) throw new AppError("A file is required", 400);

    // The creator is the authenticated user's employee record, not the platform user id.
    const { employeeId } = await getEmployeeForUser(Number(req.user!.id));

    const created = await documentService.createDocument({
      ...req.body,
      access: parseAccessField(req.body.access),
      createdById: employeeId,
      file,
    });

    res.status(201);
    sendResponse(res, {
      success: true,
      message: "Document created successfully",
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

export const updateDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const file = uploadedFile(req);
    const updated = await documentService.updateDocument(req.params.id, {
      ...req.body,
      access: req.body.access !== undefined ? parseAccessField(req.body.access) : undefined,
      file,
    });
    sendResponse(res, { success: true, message: "Document updated successfully", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await documentService.deleteDocument(req.params.id);
    sendResponse(res, { success: true, message: "Document archived successfully", data: {} });
  } catch (err) {
    next(err);
  }
};

export const downloadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ctx = await accessContext(req);
    const { url } = await documentService.getDownloadUrl(req.params.id, ctx);
    res.redirect(302, url);
  } catch (err) {
    next(err);
  }
};

/** JSON (not a redirect): the frontend needs the raw URL string to embed in a native <iframe>/
 * <img>/<video> or hand to the Office Online Viewer — a 302 only helps a top-level navigation. */
export const getDocumentViewUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ctx = await accessContext(req);
    const { url, fileName } = await documentService.getViewUrl(req.params.id, ctx);
    sendResponse(res, { success: true, message: "View URL generated", data: { url, fileName } });
  } catch (err) {
    next(err);
  }
};

/** Raw text content for formats the frontend renders itself (csv/txt/json/xml/css/js). */
export const getDocumentContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ctx = await accessContext(req);
    const { text, fileName, truncated } = await documentService.getViewableText(req.params.id, ctx);
    sendResponse(res, {
      success: true,
      message: "Document content fetched",
      data: { text, fileName, truncated },
    });
  } catch (err) {
    next(err);
  }
};
