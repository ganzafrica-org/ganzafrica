import { Request, Response } from "express";
import { constants, Logger } from "../../config";
import { AppError } from "../../middlewares";
import * as leaveService from "../../services/hr/leave.service";
import { getHrRequester } from "../../utils/hr-requester";
/**
 * @swagger
 * /hr/leaves:
 *   get:
 *     summary: List all leave requests
 *     tags: [HR Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaves fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HrLeave'
 *
 * /hr/employees/{employeeId}/leaves:
 *   get:
 *     summary: List employee leave requests
 *     tags: [HR Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Leaves fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HrLeave'
 *   post:
 *     summary: Create leave request
 *     tags: [HR Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrLeave'
 *     responses:
 *       201:
 *         description: Leave request created
 *
 * /hr/leaves/{id}:
 *   patch:
 *     summary: Update leave request
 *     tags: [HR Leaves]
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
 *             $ref: '#/components/schemas/HrLeave'
 *     responses:
 *       200:
 *         description: Leave request updated
 *
 * /hr/leaves/{id}/cancel:
 *   post:
 *     summary: Cancel leave request
 *     tags: [HR Leaves]
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
 *         description: Leave request cancelled
 *
 * /hr/leaves/{id}/approve:
 *   post:
 *     summary: Approve leave request
 *     tags: [HR Leaves]
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
 *         description: Leave request approved
 *
 * /hr/leaves/{id}/reject:
 *   post:
 *     summary: Reject leave request
 *     tags: [HR Leaves]
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
 *         description: Leave request rejected
 */
import type { CreateLeaveInput, UpdateLeaveInput } from "@/types/leave.types";

const logger = new Logger("LeaveController");

function handleErrorResponse(error: unknown, res: Response, errorType: string): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: errorType, message: error.message });
  } else {
    res.status(500).json({
      error: errorType,
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}

function parseLeaveInput(body: Record<string, unknown>): CreateLeaveInput {
  return {
    type: body.type as CreateLeaveInput["type"],
    startDate: new Date(body.startDate as string),
    endDate: new Date(body.endDate as string),
    reason: (body.reason as string | null | undefined) ?? null,
  };
}

export const listAllLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaves = await leaveService.listAllLeaves(await getHrRequester(req));
    res.status(200).json(leaves);
  } catch (error) {
    logger.error("List all leaves error", error);
    handleErrorResponse(error, res, "List Leaves Error");
  }
};

export const listEmployeeLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaves = await leaveService.listLeavesByEmployee(
      await getHrRequester(req),
      req.params.employeeId,
    );
    res.status(200).json(leaves);
  } catch (error) {
    logger.error("List employee leaves error", error);
    handleErrorResponse(error, res, "List Employee Leaves Error");
  }
};

export const createLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const leave = await leaveService.createLeave(
      await getHrRequester(req),
      req.params.employeeId,
      parseLeaveInput(req.body),
    );
    res.status(201).json(leave);
  } catch (error) {
    logger.error("Create leave error", error);
    handleErrorResponse(error, res, "Create Leave Error");
  }
};

export const updateLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as UpdateLeaveInput & { startDate?: string; endDate?: string };
    const leave = await leaveService.updateLeave(await getHrRequester(req), req.params.id, {
      type: body.type,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      reason: body.reason,
    });
    res.status(200).json(leave);
  } catch (error) {
    logger.error("Update leave error", error);
    handleErrorResponse(error, res, "Update Leave Error");
  }
};

export const cancelLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const leave = await leaveService.cancelLeave(await getHrRequester(req), req.params.id);
    res.status(200).json(leave);
  } catch (error) {
    logger.error("Cancel leave error", error);
    handleErrorResponse(error, res, "Cancel Leave Error");
  }
};

export const approveLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const leave = await leaveService.approveLeave(await getHrRequester(req), req.params.id);
    res.status(200).json(leave);
  } catch (error) {
    logger.error("Approve leave error", error);
    handleErrorResponse(error, res, "Approve Leave Error");
  }
};

export const rejectLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const leave = await leaveService.rejectLeave(await getHrRequester(req), req.params.id);
    res.status(200).json(leave);
  } catch (error) {
    logger.error("Reject leave error", error);
    handleErrorResponse(error, res, "Reject Leave Error");
  }
};
