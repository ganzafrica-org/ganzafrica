import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import * as leaveService from "@/services/leave.service";

export const listLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = req.query as unknown as { page?: string; limit?: string };
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await leaveService.listLeaves(
      { id: req.user!.id, role: req.user!.role },
      { page, limit },
    );

    sendResponse(res, {
      success: true,
      message: "Leave requests fetched",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const getLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leave = await leaveService.getLeave({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Leave fetched", data: leave });
  } catch (err) {
    next(err);
  }
};

export const createLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await leaveService.createLeave(
      { id: req.user!.id, role: req.user!.role },
      {
        type: req.body.type,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        reason: req.body.reason,
      },
    );
    res.status(201);
    sendResponse(res, { success: true, message: "Leave request created", data: created });
  } catch (err) {
    next(err);
  }
};

export const reviewLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await leaveService.reviewLeave(
      { id: req.user!.id, role: req.user!.role },
      req.params.id,
      req.body.status,
    );
    sendResponse(res, { success: true, message: "Leave reviewed", data: updated });
  } catch (err) {
    next(err);
  }
};

export const cancelLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await leaveService.cancelLeave({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Leave cancelled", data: {} });
  } catch (err) {
    next(err);
  }
};

export const leaveController = { listLeave, getLeave, createLeave, reviewLeave, cancelLeave };