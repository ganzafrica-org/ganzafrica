import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare const handleZodError: (err: ZodError) => AppError;
export declare const handleDatabaseError: (err: any) => AppError;
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=error.middleware.d.ts.map