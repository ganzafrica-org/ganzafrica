import { Request, Response } from "express";
/**
 * @swagger
 * /hr/helpdesk:
 *   get:
 *     summary: List helpdesk tickets
 *     tags: [HR Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: submittedBy
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tickets fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HrHelpdeskTicket'
 *   post:
 *     summary: Create helpdesk ticket
 *     tags: [HR Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrHelpdeskTicket'
 *     responses:
 *       201:
 *         description: Ticket created
 *
 * /hr/helpdesk/{id}:
 *   get:
 *     summary: Get ticket details
 *     tags: [HR Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ticket fetched
 *   patch:
 *     summary: Update ticket
 *     tags: [HR Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrHelpdeskTicket'
 *     responses:
 *       200:
 *         description: Ticket updated
 *   delete:
 *     summary: Delete ticket
 *     tags: [HR Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ticket deleted
 *
 * /hr/helpdesk/{id}/answer:
 *   post:
 *     summary: Answer helpdesk ticket
 *     tags: [HR Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket answered
 */
import { constants, Logger } from "../../config";
import { AppError } from "../../middlewares";
import * as helpdeskService from "../../services/hr/helpdesk.service";

const logger = new Logger("HelpdeskController");

function handleErrorResponse(error: unknown, res: Response, errorType: string): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: errorType,
      message: error.message,
    });
  } else {
    res.status(500).json({
      error: errorType,
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}

export const listTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as {
      status?: helpdeskService.TicketStatus;
      submittedBy?: string;
      assignedTo?: string;
    };

    const tickets = await helpdeskService.listTickets({
      status: query.status,
      submittedBy: query.submittedBy,
      assignedTo: query.assignedTo,
    });

    res.status(200).json(tickets);
  } catch (error) {
    logger.error("List tickets error", error);
    handleErrorResponse(error, res, "List Tickets Error");
  }
};

export const getTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await helpdeskService.getTicketById(req.params.id);
    res.status(200).json(ticket);
  } catch (error) {
    logger.error("Get ticket error", error);
    handleErrorResponse(error, res, "Get Ticket Error");
  }
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await helpdeskService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    logger.error("Create ticket error", error);
    handleErrorResponse(error, res, "Create Ticket Error");
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await helpdeskService.updateTicket(req.params.id, req.body);
    res.status(200).json(ticket);
  } catch (error) {
    logger.error("Update ticket error", error);
    handleErrorResponse(error, res, "Update Ticket Error");
  }
};

export const answerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await helpdeskService.answerTicket(req.params.id, req.body.answer);
    res.status(200).json(ticket);
  } catch (error) {
    logger.error("Answer ticket error", error);
    handleErrorResponse(error, res, "Answer Ticket Error");
  }
};

export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    await helpdeskService.deleteTicket(req.params.id);
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    logger.error("Delete ticket error", error);
    handleErrorResponse(error, res, "Delete Ticket Error");
  }
};
