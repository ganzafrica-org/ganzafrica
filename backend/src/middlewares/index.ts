import {
  authenticate,
  authenticateHr,
  authorize,
  isAdmin,
  isTeamOrAdmin,
  requireRole,
  setDbContextMiddleware,
} from "./auth.middleware";
import { errorHandler, notFoundHandler, AppError } from "./error.middleware";
import { validate, makeRateLimiter } from "./validation.middleware";

export {
  authenticate,
  authenticateHr,
  authorize,
  isAdmin,
  isTeamOrAdmin,
  requireRole,
  setDbContextMiddleware,
  errorHandler,
  notFoundHandler,
  AppError,
  validate,
  makeRateLimiter
};