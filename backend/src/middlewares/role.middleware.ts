import { RequestHandler } from "express";
import { constants } from "../config";

export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    const role = req.user?.role;
    const baseRole = req.user?.base_role;
    const roleList = req.user?.roles ?? [];
    const ok =
      (role && roles.includes(role)) ||
      (baseRole && roles.includes(baseRole)) ||
      roleList.some((r) => roles.includes(r));

    if (!ok) {
      res.status(403).json({
        success: false,
        message: constants.ERROR_MESSAGES.FORBIDDEN,
      });
      return;
    }

    next();
  };

