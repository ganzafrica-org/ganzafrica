import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import * as policyService from "@/services/policy.service";

export const listPolicies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = req.query as unknown as Record<string, string | undefined>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await policyService.listPolicies(
      { id: req.user!.id, role: req.user!.role },
      {
        page,
        limit,
        category: q.category,
        status: q.status as policyService.PolicyStatus | undefined,
        sortBy: q.sortBy as any,
        sortOrder: (q.sortOrder as "asc" | "desc" | undefined) ?? "desc",
      },
    );

    sendResponse(res, {
      success: true,
      message: "Policies fetched",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const getPolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const policy = await policyService.getPolicy({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Policy fetched", data: policy });
  } catch (err) {
    next(err);
  }
};

export const createPolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await policyService.createPolicy({ id: req.user!.id, role: req.user!.role }, req.body);
    res.status(201);
    sendResponse(res, { success: true, message: "Policy created", data: created });
  } catch (err) {
    next(err);
  }
};

export const updatePolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await policyService.updatePolicy({ id: req.user!.id, role: req.user!.role }, req.params.id, req.body);
    sendResponse(res, { success: true, message: "Policy updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deletePolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await policyService.deletePolicy({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Policy deleted", data: {} });
  } catch (err) {
    next(err);
  }
};

export const downloadPolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { absolutePath, fileName } = await policyService.incrementDownloadsAndGetPath(
      { id: req.user!.id, role: req.user!.role },
      req.params.id,
    );

    res.download(absolutePath, fileName, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    next(err);
  }
};

export const policyController = { listPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy, downloadPolicy };