import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role_id: number;
                role_name?: string;
                roles?: string[];
                avatar_url?: string;
                email_verified: boolean;
            };
            sessionId?: string;
        }
    }
}
/**
 * Authentication middleware that verifies the JWT token
 * and attaches the user to the request object
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Authorization middleware factory that checks if the user has any of the required roles
 * @param {string[]} allowedRoles - List of roles that have access
 */
export declare const authorize: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware to check if user has admin role
 */
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware to check if user has team role or admin role
 */
export declare const isTeamOrAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Set database context middleware
 * Sets the user ID and IP address in the database context for audit logging
 */
export declare const setDbContextMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map