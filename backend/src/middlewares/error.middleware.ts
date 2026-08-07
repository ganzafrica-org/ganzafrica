import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { env, Logger, constants } from "../config";

const logger = new Logger("ErrorMiddleware");

// Custom application error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates this is a known operational error
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle validation errors from Zod
export const handleZodError = (err: ZodError) => {
  const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
  return new AppError(message, 400);
};

// Handle database errors
export const handleDatabaseError = (err: any) => {
  let message = "Database operation failed";
  let statusCode = 500;

  // Check for specific database error types that might be client errors
  if (err.code === "23505") {
    // Unique violation
    message = "A record with this data already exists";
    statusCode = 409; // Conflict
  } else if (err.code === "23503") {
    // Foreign key violation
    message = "Referenced record does not exist";
    statusCode = 400; // Bad request
  }

  return new AppError(message, statusCode);
};

// Handle multer upload errors (oversized file, unexpected field, etc.) as a clear 422 instead
// of a generic 500 — the size/type problem is the client's to fix, not a server fault.
export const handleMulterError = (err: MulterError) => new AppError(err.message, 422, err.code);

// Global error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error(`${req.method} ${req.path} - ${error.message}`, {
    stack: err.stack,
    statusCode: err.statusCode,
  });

  // Handle specific error types
  if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof MulterError) {
    error = handleMulterError(err);
  } else if (err.code && (err.code.startsWith("22") || err.code.startsWith("23"))) {
    error = handleDatabaseError(err);
  }

  // Send response
  const statusCode = error.statusCode || 500;
  const message = error.message || constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal Server Error" : "Request Error",
    message:
      statusCode >= 500 && env.NODE_ENV === "production"
        ? constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        : message,
    ...(error.code && { code: error.code }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 Not Found middleware
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Resource not found: ${req.originalUrl}`,
  });
};
