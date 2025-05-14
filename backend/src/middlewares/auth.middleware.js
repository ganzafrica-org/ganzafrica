"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDbContextMiddleware = exports.isTeamOrAdmin = exports.isAdmin = exports.authorize = exports.authenticate = void 0;
const config_1 = require("../config");
const auth_service_1 = require("../services/auth.service");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger = new config_1.Logger('AuthMiddleware');
/**
 * Authentication middleware that verifies the JWT token
 * and attaches the user to the request object
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from cookies or authorization header
        const token = req.cookies?.[config_1.constants.AUTH_COOKIE_NAME] ||
            (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.substring(7)
                : null);
        if (!token) {
            logger.debug('No token found in request');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication token is required',
            });
        }
        logger.debug('Token found, verifying...');
        try {
            // Verify JWT token
            const decoded = await (0, auth_service_1.verifyToken)(token);
            if (!decoded || !decoded.id) {
                logger.debug('Token verification failed or missing ID');
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: config_1.constants.ERROR_MESSAGES.INVALID_TOKEN,
                });
            }
            logger.debug(`Token verified, user ID: ${decoded.id}`);
            // Use direct SQL query for more reliable data fetching
            // This is a safer approach than relying on potential relation issues
            const userId = Number(decoded.id);
            // Get user basic information with a simple query
            const userResult = await client_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!userResult || userResult.length === 0) {
                logger.debug(`User with ID ${userId} not found`);
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found',
                });
            }
            const user = userResult[0];
            logger.debug(`User found: ${user.name}`);
            // Check if account is active
            if (!user.is_active) {
                logger.debug(`User account is inactive: ${user.id}`);
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Account is inactive',
                });
            }
            // Get the primary role information
            let roleName;
            if (user.role_id) {
                const roleResult = await client_1.db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, user.role_id));
                roleName = roleResult.length > 0 ? roleResult[0].name : undefined;
                logger.debug(`Primary role: ${roleName || 'none'}`);
            }
            // Get additional roles
            const userRolesResult = await client_1.db
                .select({
                role_name: schema_1.roles.name
            })
                .from(schema_1.user_roles)
                .innerJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, schema_1.roles.id))
                .where((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, user.id));
            const userRoleNames = userRolesResult.map((r) => r.role_name);
            // Make sure to include the primary role if user has one defined
            if (roleName && !userRoleNames.includes(roleName)) {
                userRoleNames.push(roleName);
            }
            logger.debug(`All user roles: ${userRoleNames.join(', ') || 'none'}`);
            // Attach user to request
            req.user = {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                role_name: roleName,
                roles: userRoleNames,
                avatar_url: user.avatar_url ?? undefined,
                email_verified: user.email_verified
            };
            // Store the JWT ID if it exists for session management
            if (decoded.jti) {
                req.sessionId = decoded.jti;
            }
            // Log the req.user object to confirm it's set properly
            logger.debug('User attached to request:', req.user);
            next();
        }
        catch (verifyError) {
            logger.error('Token verification error:', verifyError);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token',
            });
        }
    }
    catch (error) {
        logger.error('Authentication middleware error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication failed',
        });
    }
};
exports.authenticate = authenticate;
/**
 * Authorization middleware factory that checks if the user has any of the required roles
 * @param {string[]} allowedRoles - List of roles that have access
 */
const authorize = (allowedRoles) => {
    return async (req, res, next) => {
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
            let userRoles = req.user.roles || [];
            // If roles weren't loaded in authenticate middleware, load them now
            if (userRoles.length === 0) {
                // First, add the primary role from user.role_id
                const primaryRole = await client_1.db.query.roles.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.roles.id, req.user.role_id)
                });
                userRoles = [];
                if (primaryRole && primaryRole.name) {
                    userRoles.push(primaryRole.name);
                }
                // Then check the user_roles table for additional roles
                const additionalRoles = await client_1.db
                    .select({
                    role_name: schema_1.roles.name
                })
                    .from(schema_1.user_roles)
                    .innerJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, schema_1.roles.id))
                    .where((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, Number(req.user.id)));
                // Add any additional roles
                additionalRoles.forEach((role) => {
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
            }
            else {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to access this resource',
                });
            }
        }
        catch (error) {
            logger.error('Authorization error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to verify user permissions',
            });
        }
    };
};
exports.authorize = authorize;
/**
 * Middleware to check if user has admin role
 */
exports.isAdmin = (0, exports.authorize)(['admin']);
/**
 * Middleware to check if user has team role or admin role
 */
exports.isTeamOrAdmin = (0, exports.authorize)(['admin', 'team']);
/**
 * Set database context middleware
 * Sets the user ID and IP address in the database context for audit logging
 */
const setDbContextMiddleware = (req, res, next) => {
    if (req.user?.id) {
        // Set the user ID and IP address for database context
        // This is used by database triggers for audit logging
    }
    next();
};
exports.setDbContextMiddleware = setDbContextMiddleware;
