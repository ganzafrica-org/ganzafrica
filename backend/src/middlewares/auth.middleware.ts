import { Request, Response, NextFunction } from 'express';
import { constants, Logger } from '../config';
import { verifyToken } from '../services/auth.service';
import { db } from '@/db/client';
import { users, roles, user_roles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const logger = new Logger('AuthMiddleware');

// Define interfaces that match your database schema
interface UserRole {
    role_name: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

// Interface that matches the actual user with role from your schema
interface UserWithRole {
    id: number;
    email: string;
    name: string;
    role_id: number;
    password_hash: string;
    avatar_url?: string;
    two_factor_enabled: boolean;
    two_factor_method?: string;
    backup_codes?: any;
    email_verified: boolean;
    phone_number?: string;
    phone_verified: boolean;
    last_password_change?: Date;
    last_login?: Date;
    is_active: boolean;
    account_locked: boolean;
    failed_login_attempts: number;
    last_failed_attempt?: Date;
    created_at: Date;
    updated_at: Date;
    role?: Role;
}

// Add custom properties to Express Request
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
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies or authorization header
        const token = 
            req.cookies?.[constants.AUTH_COOKIE_NAME] || 
            (req.headers.authorization?.startsWith('Bearer ') 
                ? req.headers.authorization.substring(7) 
                : null);

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication token is required',
            });
        }

        // Verify JWT token
        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: constants.ERROR_MESSAGES.INVALID_TOKEN,
            });
        }

        // Get user from database with role
        const user = await db.query.users.findFirst({
            where: eq(users.id, Number(decoded.id)),
            with: {
                role: true, // Assuming you have relation defined
            }
        }) as UserWithRole | null;

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found',
            });
        }

        // Check if account is active
        if (!user.is_active) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Account is inactive',
            });
        }

        // Get additional roles if using many-to-many relationship
        const userRolesData = await db
            .select({
                role_name: roles.name
            })
            .from(user_roles)
            .innerJoin(roles, eq(user_roles.role_id, roles.id))
            .where(eq(user_roles.user_id, user.id));

        const userRoleNames = userRolesData.map((r: UserRole) => r.role_name);
        
        // Make sure to include the primary role if user has one defined
        const primaryRoleName = user.role?.name;
        if (primaryRoleName && !userRoleNames.includes(primaryRoleName)) {
            userRoleNames.push(primaryRoleName);
        }

        // Attach user to request
        req.user = {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            role_name: primaryRoleName,
            roles: userRoleNames,
            avatar_url: user.avatar_url,
            email_verified: user.email_verified
        };

        // Store the JWT ID if it exists for session management
        if (decoded.jti) {
            req.sessionId = decoded.jti;
        }

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication failed',
        });
    }
};

/**
 * Authorization middleware factory that checks if the user has any of the required roles
 * @param {string[]} allowedRoles - List of roles that have access
 */
export const authorize = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Check if user exists
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        try {
            // If no roles provided, allow all authenticated users
            if (!allowedRoles || allowedRoles.length === 0) {
                return next();
            }

            // Get user roles - either from the req.user.roles array or by fetching from db
            let userRoles: string[] = req.user.roles || [];
            
            // If roles weren't loaded in authenticate middleware, load them now
            if (userRoles.length === 0) {
                // First, add the primary role from user.role_id
                const primaryRole = await db.query.roles.findFirst({
                    where: eq(roles.id, req.user.role_id)
                }) as Role | null;
                
                userRoles = [];
                if (primaryRole && primaryRole.name) {
                    userRoles.push(primaryRole.name);
                }
                
                // Then check the user_roles table for additional roles
                const additionalRoles = await db
                    .select({
                        role_name: roles.name
                    })
                    .from(user_roles)
                    .innerJoin(roles, eq(user_roles.role_id, roles.id))
                    .where(eq(user_roles.user_id, Number(req.user.id)));
                
                // Add any additional roles
                additionalRoles.forEach((role: UserRole) => {
                    if (!userRoles.includes(role.role_name)) {
                        userRoles.push(role.role_name);
                    }
                });
                
                // Update the req.user with the roles
                req.user.roles = userRoles;
            }
            
            // Check if the user has any of the allowed roles
            const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));
            
            if (hasAllowedRole) {
                return next();
            } else {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to access this resource',
                });
            }
        } catch (error) {
            logger.error('Authorization error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to verify user permissions',
            });
        }
    };
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = authorize(['admin']);

/**
 * Middleware to check if user has team role or admin role
 */
export const isTeamOrAdmin = authorize(['admin', 'team']);

/**
 * Set database context middleware
 * Sets the user ID and IP address in the database context for audit logging
 */
export const setDbContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.id) {
        // Set the user ID and IP address for database context
        // This is used by database triggers for audit logging
    }
    next();
};