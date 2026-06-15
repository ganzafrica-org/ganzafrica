import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import * as helpdeskService from "@/services/helpdesk.service";

export const listTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = req.query as unknown as { page?: string; limit?: string };
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await helpdeskService.listTickets(
      { id: req.user!.id, role: req.user!.role },
      { page, limit },
    );

    sendResponse(res, {
      success: true,
      message: "Tickets fetched",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const getTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await helpdeskService.getTicket({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Ticket fetched", data: ticket });
  } catch (err) {
    next(err);
  }
};

export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await helpdeskService.createTicket({ id: req.user!.id, role: req.user!.role }, req.body);
    res.status(201);
    sendResponse(res, { success: true, message: "Ticket created", data: created });
  } catch (err) {
    next(err);
  }
};

export const assignTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await helpdeskService.assignToSelf({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Ticket assigned", data: updated });
  } catch (err) {
    next(err);
  }
};

export const answerTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await helpdeskService.answerTicket(
      { id: req.user!.id, role: req.user!.role },
      req.params.id,
      req.body.answer,
    );
    sendResponse(res, { success: true, message: "Ticket answered", data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await helpdeskService.updateStatus(
      { id: req.user!.id, role: req.user!.role },
      req.params.id,
      req.body.status,
    );
    sendResponse(res, { success: true, message: "Ticket status updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await helpdeskService.deleteTicket({ id: req.user!.id, role: req.user!.role }, req.params.id);
    sendResponse(res, { success: true, message: "Ticket deleted", data: {} });
  } catch (err) {
    next(err);
  }
};

