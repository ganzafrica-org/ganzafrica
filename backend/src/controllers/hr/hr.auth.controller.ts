import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import { AppError } from "@/middlewares";
import * as hrAuthService from "@/services/hr/hr.auth.service";

/**
 * @swagger
 * /hr/auth/login:
 *   post:
 *     summary: HR login
 *     tags: [HR Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HrTokenResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /hr/auth/logout:
 *   post:
 *     summary: HR logout
 *     tags: [HR Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /hr/auth/me:
 *   get:
 *     summary: Get current HR user
 *     tags: [HR Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/HrEmployee'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export const loginHr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, tokens } = await hrAuthService.login(req.body);
    sendResponse(res, {
      success: true,
      message: "Login successful",
      data: { user, ...tokens },
    });
  } catch (err) {
    next(err);
  }
};

export const logoutHr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);
    await hrAuthService.logout(req.user.id);
    sendResponse(res, {
      success: true,
      message: "Logged out",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

export const getMeHr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);
    const user = await hrAuthService.getMe(req.user.id);
    sendResponse(res, {
      success: true,
      message: "Current user fetched",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
