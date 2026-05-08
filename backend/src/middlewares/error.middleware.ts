import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env, Logger, constants } from "../config";

const logger = new Logger("ErrorMiddleware");

// Custom application error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates this is a known operational error

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle validation errors from Zod
export const handleZodError = (err: ZodError) => {
  const message = err.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
  return new AppError(message, 422); // Unprocessable Entity (request is valid but cannot be processed, it's against the rules)
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
  } else if (err.code === "23502") {
    // Not null violation
    message = "Missing required field";
    statusCode = 400;
  } else if (err.code === "23503") {
    // Foreign key violation
    message = "Referenced record does not exist";
    statusCode = 400; // Bad request
  } else if (err.code === "22P02") {
    // invalid_text_representation
    message = "Invalid input format";
    statusCode = 400;
  }

  return new AppError(message, statusCode);
};

// Global error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: unknown = err;
  const messageFromErr =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: unknown }).message)
      : "Unknown error";

  // Log the error
  logger.error(`${req.method} ${req.path} - ${messageFromErr}`, {
    stack: err?.stack,
    statusCode: err?.statusCode,
  });

  // Handle specific error types
  if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (
    err.code &&
    (err.code.startsWith("22") || err.code.startsWith("23"))
  ) {
    error = handleDatabaseError(err);
  }

  // Normalize to AppError
  const normalized: AppError =
    error instanceof AppError
      ? error
      : error instanceof ZodError
        ? handleZodError(error)
        : new AppError(constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);

  const statusCode = normalized.statusCode || 500;
  const message = normalized.message || constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && env.NODE_ENV === "production"
        ? constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        : message,
    ...(env.NODE_ENV === "development" && err?.stack
      ? { stack: err.stack }
      : {}),
  });
};

// 404 Not Found middleware
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
};
