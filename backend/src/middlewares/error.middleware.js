"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.handleDatabaseError = exports.handleZodError = exports.AppError = void 0;
const zod_1 = require("zod");
const config_1 = require("../config");
const logger = new config_1.Logger("ErrorMiddleware");
// Custom application error class
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Indicates this is a known operational error
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Handle validation errors from Zod
const handleZodError = (err) => {
    const message = err.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
    return new AppError(message, 400);
};
exports.handleZodError = handleZodError;
// Handle database errors
const handleDatabaseError = (err) => {
    let message = "Database operation failed";
    let statusCode = 500;
    // Check for specific database error types that might be client errors
    if (err.code === "23505") {
        // Unique violation
        message = "A record with this data already exists";
        statusCode = 409; // Conflict
    }
    else if (err.code === "23503") {
        // Foreign key violation
        message = "Referenced record does not exist";
        statusCode = 400; // Bad request
    }
    return new AppError(message, statusCode);
};
exports.handleDatabaseError = handleDatabaseError;
// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log the error
    logger.error(`${req.method} ${req.path} - ${error.message}`, {
        stack: err.stack,
        statusCode: err.statusCode,
    });
    // Handle specific error types
    if (err instanceof zod_1.ZodError) {
        error = (0, exports.handleZodError)(err);
    }
    else if (err.code &&
        (err.code.startsWith("22") || err.code.startsWith("23"))) {
        error = (0, exports.handleDatabaseError)(err);
    }
    // Send response
    const statusCode = error.statusCode || 500;
    const message = error.message || config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({
        error: statusCode >= 500 ? "Internal Server Error" : "Request Error",
        message: statusCode >= 500 && config_1.env.NODE_ENV === "production"
            ? config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            : message,
        // Include stack trace in development mode
        ...(config_1.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
// 404 Not Found middleware
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Resource not found: ${req.originalUrl}`,
    });
};
exports.notFoundHandler = notFoundHandler;
