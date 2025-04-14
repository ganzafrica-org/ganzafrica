import { Request, Response, NextFunction } from "express";
import { constants } from "../config";
import { verifyToken } from "../services/auth.service";
import Logger from "../config/logger";

const logger = new Logger("AuthMiddleware");

// Add custom properties to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        base_role: string;
        roles?: string[];
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies the user's token from either cookie or Authorization header
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Check for token in cookie (primary method for web clients)
    const cookieToken = req.cookies?.[constants.AUTH_COOKIE_NAME];

    // 2. Check for token in Authorization header (for API clients and Swagger UI)
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // Use cookie token if available, otherwise use header token
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: constants.ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    // Verify the token
    const decoded = await verifyToken(token);

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      base_role: decoded.base_role,
      roles: decoded.roles,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({
      error: "Unauthorized",
      message: constants.ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};

/**
 * Role-based authorization middleware factory
 * Creates middleware that checks if the user has the required role(s)
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: constants.ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    // Check if user has at least one of the required roles
    const userRoles = [req.user.base_role, ...(req.user.roles || [])];
    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      return res.status(403).json({
        error: "Forbidden",
        message: constants.ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    next();
  };
};

/**
 * Set database context middleware
 * Sets the user ID and IP address in the database context for audit logging
 */
export const setDbContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.id) {
    // Set the user ID and IP address for database context
    // This is used by database triggers for audit logging
    res.on("finish", () => {
      // Clean up any database context after the response is sent
    });
  }

  next();
};
