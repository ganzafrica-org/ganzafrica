import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
/**
 * Factory function that creates middleware to validate request data against a Zod schema
 */
export declare const validate: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=validation.middleware.d.ts.map