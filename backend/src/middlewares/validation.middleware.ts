import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "./error.middleware";
import Logger from "../config/logger";

const logger = new Logger("ValidationMiddleware");

/**
 * Factory function that creates middleware to validate request data against a Zod schema
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create validation payload with all possible request parts
      const validationPayload: any = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      // Add files to the validation payload if they exist
      if (req.files) {
        validationPayload.files = req.files;
      } else if (req.file) {
        validationPayload.file = req.file;
      }

      // Handle JSON fields in multipart/form-data requests — must run BEFORE schema.parseAsync
      // below, since these fields arrive as JSON-stringified strings over multipart and would
      // otherwise fail shape validation (e.g. "expected array, received string") before ever
      // reaching this parsing step.
      if (req.is("multipart/form-data") && req.body) {
        const jsonFields = [
          "goals",
          "outcomes",
          "media",
          "other_information",
          "members",
          "partners",
          "specs",
        ];

        for (const field of jsonFields) {
          if (req.body[field] && typeof req.body[field] === "string") {
            try {
              req.body[field] = JSON.parse(req.body[field]);
            } catch (error) {
              logger.error(`Error parsing JSON field ${field}`, error);
              // Don't throw here, let the schema validation handle it
            }
          }
        }
      }

      // Parse and validate request data with Zod schema
      await schema.parseAsync(validationPayload);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        logger.debug("Validation error", formattedErrors);

        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid request data",
          details: formattedErrors,
        });
      }

      return next(error);
    }
  };
};

/**
 * Rate limiting middleware factory
 * Creates middleware that limits requests based on IP address
 */
export const makeRateLimiter = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, { count: number; startTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const now = Date.now();

    // Clean up expired records
    for (const [key, data] of requests.entries()) {
      if (now - data.startTime > windowMs) {
        requests.delete(key);
      }
    }

    // Check and update rate limit for this IP
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, startTime: now });
    } else {
      const data = requests.get(ip)!;

      // Reset if window has passed
      if (now - data.startTime > windowMs) {
        data.count = 1;
        data.startTime = now;
      } else if (data.count >= maxRequests) {
        // Rate limit exceeded
        return res.status(429).json({
          error: "Too Many Requests",
          message: "Too many requests, please try again later",
          retryAfter: Math.ceil((data.startTime + windowMs - now) / 1000),
        });
      } else {
        // Increment count
        data.count += 1;
      }
    }

    next();
  };
};
