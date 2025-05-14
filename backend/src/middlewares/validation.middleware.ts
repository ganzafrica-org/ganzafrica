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

      // Parse and validate request data with Zod schema
      await schema.parseAsync(validationPayload);

      // Handle JSON fields in multipart/form-data requests
      if (req.is("multipart/form-data") && req.body) {
        const jsonFields = [
          "goals",
          "outcomes",
          "media",
          "other_information",
          "members",
          "partners",
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
