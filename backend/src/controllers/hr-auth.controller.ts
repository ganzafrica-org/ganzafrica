import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import { AppError } from "@/middlewares";
import * as hrAuthService from "@/services/hrAuth.service";

export const generateOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);
    const { email } = req.body as { email: string };

    const otp = await hrAuthService.createOtp(req.user.id, email);
    sendResponse(res, {
      success: true,
      message: "OTP generated",
      data: { email, code: otp.code, expiresAt: otp.expiresAt },
    });
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await hrAuthService.registerWithOtp(req.body);
    res.status(201);
    sendResponse(res, {
      success: true,
      message: "User registered",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await hrAuthService.refresh(refreshToken);
    sendResponse(res, {
      success: true,
      message: "Token refreshed",
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

