import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import * as assetsService from "@/services/assets.service";

export const listAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = req.query as unknown as Record<string, string | undefined>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await assetsService.listAssets(
      { id: req.user!.id, role: req.user!.role },
      {
        page,
        limit,
        owner: q.owner,
        hasIssue: (q.hasIssue as "YES" | "NO" | undefined) ?? undefined,
        isFlagged: q.isFlagged === undefined ? undefined : q.isFlagged === "true",
        assignedFrom: q.assignedFrom ? new Date(q.assignedFrom) : undefined,
        assignedTo: q.assignedTo ? new Date(q.assignedTo) : undefined,
        sortBy: q.sortBy,
        sortOrder: (q.sortOrder as "asc" | "desc" | undefined) ?? "desc",
      },
    );

    sendResponse(res, {
      success: true,
      message: "Assets fetched",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const exportAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = req.query as unknown as Record<string, string | undefined>;
    const { data } = await assetsService.listAssets(
      { id: req.user!.id, role: req.user!.role },
      {
        page: 1,
        limit: 100000,
        owner: q.owner,
        hasIssue: (q.hasIssue as "YES" | "NO" | undefined) ?? undefined,
        isFlagged: q.isFlagged === undefined ? undefined : q.isFlagged === "true",
        assignedFrom: q.assignedFrom ? new Date(q.assignedFrom) : undefined,
        assignedTo: q.assignedTo ? new Date(q.assignedTo) : undefined,
        sortBy: q.sortBy,
        sortOrder: (q.sortOrder as "asc" | "desc" | undefined) ?? "desc",
      },
    );

    sendResponse(res, {
      success: true,
      message: "Assets exported",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const asset = await assetsService.getAsset({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Asset fetched", data: asset });
  } catch (err) {
    next(err);
  }
};

export const createAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const asset = await assetsService.createAsset({ id: req.user!.id, role: req.user!.role }, req.body);
    res.status(201);
    sendResponse(res, { success: true, message: "Asset created", data: asset });
  } catch (err) {
    next(err);
  }
};

export const updateAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const asset = await assetsService.updateAsset({ id: req.user!.id, role: req.user!.role }, req.params.id, req.body);
    sendResponse(res, { success: true, message: "Asset updated", data: asset });
  } catch (err) {
    next(err);
  }
};

export const deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await assetsService.deleteAsset({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Asset deleted", data: {} });
  } catch (err) {
    next(err);
  }
};

export const assignAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const asset = await assetsService.assignAsset({ id: req.user!.id, role: req.user!.role }, req.params.id, req.body.userId);
    sendResponse(res, { success: true, message: "Asset assignment updated", data: asset });
  } catch (err) {
    next(err);
  }
};

export const toggleFlag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const asset = await assetsService.toggleFlag({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Asset flag toggled", data: asset });
  } catch (err) {
    next(err);
  }
};

export const assetsController = { listAssets, exportAssets, getAsset, createAsset, updateAsset, deleteAsset, assignAsset, toggleFlag };