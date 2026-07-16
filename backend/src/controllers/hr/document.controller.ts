import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import * as documentService from "../../services/hr/document.service";
import { AppError } from "@/middlewares";

// Helper to assert user context contains IT or HR clearance roles
const assertAdminControlRole = (req: Request) => {
  const userRole = (req as any).user?.role; // Assuming authorization middleware appends user profile
  if (userRole !== "HR" && userRole !== "IT") {
    throw new AppError("Forbidden: Only HR and IT roles can control the Documents API.", 403);
  }
};

export const listDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Open visibility list checks can be left unrestricted or constrained based on permissions setup
    const q = req.query as unknown as Record<string, string | undefined>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await documentService.listDocuments({
      page,
      limit,
      category: q.category as documentService.DocumentCategory | undefined,
      status: q.status as documentService.DocumentStatus | undefined,
      sortBy: q.sortBy as documentService.ListDocumentsQuery["sortBy"],
      sortOrder: (q.sortOrder as "asc" | "desc" | undefined) ?? "desc",
    });

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

export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const document = await documentService.getDocument(req.params.id);
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
    assertAdminControlRole(req);
    const createdById = (req as any).user?.id || req.body.createdById; // Prioritize validated session identity

    const created = await documentService.createDocument({
      ...req.body,
      createdById,
    });

    res.status(201);
    sendResponse(res, {
      success: true,
      message: "Document structure created successfully",
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
    assertAdminControlRole(req);
    const updated = await documentService.updateDocument(req.params.id, req.body);
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
    assertAdminControlRole(req);
    await documentService.deleteDocument(req.params.id);
    sendResponse(res, { success: true, message: "Document deleted successfully", data: {} });
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
    const { absolutePath, fileName } = await documentService.incrementDownloadsAndGetPath(
      req.params.id,
    );

    res.download(absolutePath, fileName, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    next(err);
  }
};
