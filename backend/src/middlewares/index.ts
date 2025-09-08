import {
  authenticate,
  authorize,
  setDbContextMiddleware,
} from "./auth.middleware";
import { errorHandler, notFoundHandler, AppError } from "./error.middleware";
import { validate, makeRateLimiter } from "./validation.middleware";
import { handleOptionalUpload, handleOptionalMultipleUpload, parseFormData } from "./upload.middleware";

export {
  authenticate,
  authorize,
  setDbContextMiddleware,
  errorHandler,
  notFoundHandler,
  AppError,
  validate,
  makeRateLimiter,
  handleOptionalUpload,
  handleOptionalMultipleUpload,
  parseFormData,
};
