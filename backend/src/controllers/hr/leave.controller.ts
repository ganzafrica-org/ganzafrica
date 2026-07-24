import { Request, Response } from "express";
import { constants, Logger } from "../../config";
import { AppError } from "../../middlewares";
import * as leaveService from "../../services/hr/leave.service";

/**
 * @swagger
 * /hr/leaves:
 *   get:
 *     summary: List all leave requests (admin)
 *     tags: [HR Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaves fetched
 *
 * /hr/leaves/{id}:
 *   get:
 *     summary: Get a leave request
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
 *         description: Leave fetched
 */

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

export const listAllLeaves = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json(await leaveService.listAllLeaves());
  } catch (error) {
    logger.error("List all leaves error", error);
    handleErrorResponse(error, res, "List Leaves Error");
  }
};

export const getLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json(await leaveService.getLeaveById(req.params.id));
  } catch (error) {
    logger.error("Get leave error", error);
    handleErrorResponse(error, res, "Get Leave Error");
  }
};
