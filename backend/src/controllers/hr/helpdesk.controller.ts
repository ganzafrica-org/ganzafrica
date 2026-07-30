import { Request, Response } from "express";
import { constants, Logger } from "../../config";
import { AppError } from "../../middlewares";
import * as helpdesk from "../../services/hr/helpdesk.service";

const logger = new Logger("HelpdeskController");

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ error: context, message: error.message, code: error.code });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

const actorId = (req: Request) => Number(req.user!.id);

export const createTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await helpdesk.createTicket(actorId(req), req.body);
    return res.status(201).json({ ticket });
  } catch (e) {
    return handleError(res, e, "Create Ticket Error");
  }
};

export const listMyTickets = async (req: Request, res: Response) => {
  try {
    return res.json({ tickets: await helpdesk.listMyTickets(actorId(req)) });
  } catch (e) {
    return handleError(res, e, "List My Tickets Error");
  }
};

export const listTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await helpdesk.listTickets({
      status: req.query.status as helpdesk.TicketStatus | undefined,
      category: req.query.category as helpdesk.TicketCategory | undefined,
      priority: req.query.priority as helpdesk.TicketPriority | undefined,
      assignee_user_id: req.query.assignee ? Number(req.query.assignee) : undefined,
    });
    return res.json({ tickets });
  } catch (e) {
    return handleError(res, e, "List Tickets Error");
  }
};

export const getTicket = async (req: Request, res: Response) => {
  try {
    return res.json(await helpdesk.getTicketForViewer(actorId(req), req.params.id));
  } catch (e) {
    return handleError(res, e, "Get Ticket Error");
  }
};

export const transitionTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await helpdesk.transitionTicket(actorId(req), req.params.id, req.body);
    return res.json({ ticket });
  } catch (e) {
    return handleError(res, e, "Update Ticket Error");
  }
};

export const reopenTicket = async (req: Request, res: Response) => {
  try {
    return res.json({ ticket: await helpdesk.reopenTicket(actorId(req), req.params.id) });
  } catch (e) {
    return handleError(res, e, "Reopen Ticket Error");
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const comment = await helpdesk.addComment(actorId(req), req.params.id, req.body.body);
    return res.status(201).json({ comment });
  } catch (e) {
    return handleError(res, e, "Add Comment Error");
  }
};
