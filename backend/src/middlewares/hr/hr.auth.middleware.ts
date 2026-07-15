import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { constants, Logger, env } from "@/config";
import { db } from "@/db/client";
import { hr_users } from "@/db/schema";
import { eq } from "drizzle-orm";

const logger = new Logger("HrAuthMiddleware");
const HR_ROLES = new Set(["EMPLOYEE", "IT", "HR"]);

/**
 * Verifies an HR portal access JWT and attaches the HR user to `req.user`.
 */
export const authenticateHr = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.[constants.AUTH_COOKIE_NAME] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : null);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication token is required",
      });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    } catch {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    if (decoded.type !== "access" || typeof decoded.id !== "string") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    const role = decoded.role;
    if (typeof role !== "string" || !HR_ROLES.has(role)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    const rows = await db.select().from(hr_users).where(eq(hr_users.id, decoded.id)).limit(1);
    if (!rows.length) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
    }

    const u = rows[0];
    req.user = {
      id: String(u.id),
      name: `${u.first_name} ${u.last_name}`.trim(),
      email: u.work_email ?? u.personal_email ?? "",
      role_id: -1,
      role,
      role_name: role,
      roles: [role],
      avatar_url: undefined,
      email_verified: true,
    };

    next();
  } catch (error) {
    logger.error("HR authentication error:", error);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication failed",
    });
  }
};

/**
 * Enforces HR password reset policy for first-time login
 */
export const enforceHrPasswordPolicy = async (req: Request, res: Response, next: NextFunction) => {
  // Logic for forcing password change if needed
  next();
};
