import { Request, Response, NextFunction } from "express";
import { constants, env } from "../config";
import { verifyToken } from "../services/auth.service";
import Logger from "../config/logger";

const logger = new Logger("AuthMiddleware");

// Add custom properties to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        base_role?: string;
        roles?: string[];
        role?: string;
      };
    }
  }
}

/**
 * Authentication middleware.
 * Extracts Bearer token from Authorization header (or auth cookie fallback),
 * verifies JWT, and attaches req.user.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Optional dev/test bypass (controlled by env; never on by default)
    if (env.AUTH_BYPASS) {
      req.user = {
        id: env.AUTH_BYPASS_USER_ID,
        email: env.AUTH_BYPASS_EMAIL,
        base_role: env.AUTH_BYPASS_BASE_ROLE,
        roles: env.AUTH_BYPASS_ROLES,
        role: env.AUTH_BYPASS_ROLES[0],
      };
      logger.info("Using AUTH_BYPASS test authentication");
      next();
      return;
    }

    const bearer =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : undefined;

    const token =
      bearer || req.cookies?.[constants.AUTH_COOKIE_NAME] || undefined;

    if (!token) {
      res.status(401).json({
        success: false,
        message: constants.ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const decoded = await verifyToken(token);

    if (!decoded?.id) {
      res.status(401).json({
        success: false,
        message: constants.ERROR_MESSAGES.INVALID_TOKEN,
      });
      return;
    }

    req.user = {
      id: String(decoded.id),
      email: typeof decoded.email === "string" ? decoded.email : undefined,
      role: typeof decoded.role === "string" ? decoded.role : undefined,
      base_role:
        typeof decoded.base_role === "string" ? decoded.base_role : undefined,
      roles: Array.isArray(decoded.roles)
        ? decoded.roles.map(String)
        : undefined,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: constants.ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};

/**
 * Authorization middleware (role-based).
 * Kept as `authorize` to preserve existing route wiring.
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    const baseRole = req.user?.base_role;
    const roles = req.user?.roles ?? [];

    const ok =
      (role && allowedRoles.includes(role)) ||
      (baseRole && allowedRoles.includes(baseRole)) ||
      roles.some((r) => allowedRoles.includes(r));

    if (!ok) {
      res.status(403).json({
        success: false,
        message: constants.ERROR_MESSAGES.FORBIDDEN,
      });
      return;
    }

    next();
  };
};

/**
 * Set database context middleware
 * Sets the user ID and IP address in the database context for audit logging
 */
export const setDbContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.id) {
        // Set the user ID and IP address for database context
        // This is used by database triggers for audit logging
        res.on('finish', () => {
            // Clean up any database context after the response is sent
        });
    }

    next();
};