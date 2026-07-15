import {
  authenticate,
  authorize,
  isAdmin,
  isTeamOrAdmin,
  requireRole,
  requirePermission,
  clearPermissionCache,
  setDbContextMiddleware,
} from "./auth.middleware";
import { errorHandler, notFoundHandler, AppError } from "./error.middleware";
import { validate, makeRateLimiter } from "./validation.middleware";

export {
  authenticate,
  authorize,
  isAdmin,
  isTeamOrAdmin,
  requireRole,
  requirePermission,
  clearPermissionCache,
  setDbContextMiddleware,
  errorHandler,
  notFoundHandler,
  AppError,
  validate,
  makeRateLimiter,
};
