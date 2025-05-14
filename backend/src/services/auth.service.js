"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.createToken = createToken;
exports.createUserToken = createUserToken;
exports.verifyToken = verifyToken;
exports.createSession = createSession;
exports.invalidateSession = invalidateSession;
exports.updateSessionActivity = updateSessionActivity;
exports.sendPasswordReset = sendPasswordReset;
exports.verifyEmailToken = verifyEmailToken;
exports.resetPassword = resetPassword;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const config_1 = require("../config");
const email_service_1 = require("./email.service");
const middlewares_1 = require("../middlewares");
const logger = new config_1.Logger("AuthService");
// Configure bcrypt options for password hashing
const SALT_ROUNDS = 10;
// Set secret key for JWT
const JWT_SECRET = config_1.env.JWT_SECRET || "your-default-jwt-secret-key-should-be-updated";
const JWT_REFRESH_SECRET = config_1.env.JWT_REFRESH_SECRET ||
    "your-default-jwt-refresh-secret-key-should-be-updated";
if (JWT_SECRET === "your-default-jwt-secret-key-should-be-updated") {
    logger.warn("Using default JWT secret key. This is insecure for production environments.");
}
/**
 * Hash a password using bcrypt
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }
    catch (error) {
        logger.error("Password hashing error", error);
        throw new Error("Failed to hash password");
    }
}
/**
 * Verify a password against its hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored hash to verify against
 * @returns {Promise<boolean>} - True if password matches hash
 */
async function verifyPassword(password, hash) {
    try {
        return await bcrypt.compare(password, hash);
    }
    catch (error) {
        logger.error("Password verification error", error);
        return false;
    }
}
/**
 * Create a JWT token
 * @param {TokenPayload} payload - Data to include in the token
 * @param {string} expiresIn - Token expiration time
 * @param {boolean} isRefresh - Whether this is a refresh token
 * @returns {Promise<string>} - Signed JWT token
 */
async function createToken(payload, expiresIn = config_1.env.ACCESS_TOKEN_EXPIRY, isRefresh = false) {
    try {
        const expiresInMs = parseTimeToMs(expiresIn);
        const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
        return jwt.sign({
            ...payload,
            jti: crypto.randomUUID(),
        }, secret, {
            expiresIn: Math.floor(expiresInMs / 1000), // JWT uses seconds for expiration
        });
    }
    catch (error) {
        logger.error("Token creation error", error);
        throw new middlewares_1.AppError("Failed to create authentication token", 500);
    }
}
/**
 * Create a JWT token with complete user information
 * @param {number} userId - User ID
 * @param {string} tokenType - Token type (access or refresh)
 * @param {string} expiresIn - Token expiration time
 * @param {boolean} isRefresh - Whether this is a refresh token
 * @returns {Promise<string>} - Signed JWT token
 */
async function createUserToken(userId, tokenType, expiresIn = config_1.env.ACCESS_TOKEN_EXPIRY, isRefresh = false) {
    try {
        // Get complete user information from database using a simple query
        const userResult = await client_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        if (!userResult || userResult.length === 0) {
            throw new Error(`User with ID ${userId} not found`);
        }
        // Use the first user from the array with explicit type casting
        const userData = userResult[0];
        if (!userData) {
            throw new Error(`User with ID ${userId} not found or has no data`);
        }
        // Optional: Get role information if you have a roles table
        let roleName = undefined;
        try {
            if (userData.role_id) {
                // Using Drizzle ORM query instead of raw SQL to avoid parameter issues
                const roleResult = await client_1.db
                    .select()
                    .from(schema_1.roles)
                    .where((0, drizzle_orm_1.eq)(schema_1.roles.id, userData.role_id));
                if (roleResult && roleResult.length > 0) {
                    roleName = roleResult[0].name;
                }
            }
        }
        catch (error) {
            logger.warn("Could not fetch role information for token", error);
            // Continue without role name
        }
        // Create payload with complete user information
        const payload = {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name,
            role_id: userData.role_id,
            role_name: roleName,
            email_verified: userData.email_verified,
            avatar_url: userData.avatar_url || null,
            is_active: userData.is_active,
            type: tokenType,
        };
        // Use the existing createToken function for the actual signing
        return createToken(payload, expiresIn, isRefresh);
    }
    catch (error) {
        logger.error("User token creation error", error);
        throw new middlewares_1.AppError("Failed to create user authentication token", 500);
    }
}
/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @param {boolean} isRefresh - Whether this is a refresh token
 * @returns {Promise<TokenPayload>} - Decoded token payload
 */
async function verifyToken(token, isRefresh = false) {
    try {
        const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
        return jwt.verify(token, secret);
    }
    catch (error) {
        logger.error("Token verification error", error);
        if (error instanceof jwt.TokenExpiredError) {
            throw new middlewares_1.AppError("Token has expired", 401);
        }
        throw new middlewares_1.AppError("Invalid or expired token", 401);
    }
}
/**
 * Create a new session for a user
 * @param {number} userId - User ID
 * @param {string} ipAddress - User's IP address
 * @param {string} userAgent - User's browser/device information
 * @returns {Promise<SessionData>} - Session details with tokens
 */
async function createSession(userId, ipAddress, userAgent) {
    try {
        // Generate new tokens with complete user information
        const accessToken = await createUserToken(userId, config_1.constants.TOKEN_TYPES.ACCESS, config_1.env.ACCESS_TOKEN_EXPIRY, false);
        const refreshToken = await createUserToken(userId, config_1.constants.TOKEN_TYPES.REFRESH, config_1.env.REFRESH_TOKEN_EXPIRY, true);
        // Hash tokens for secure storage
        const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
        const accessTokenHash = await bcrypt.hash(accessToken, SALT_ROUNDS);
        const expiresAt = new Date(Date.now() + parseTimeToMs(config_1.env.REFRESH_TOKEN_EXPIRY || "7d"));
        // Option to limit number of active sessions per user
        const maxSessions = 5; // Configurable value
        const activeSessions = await client_1.db
            .select()
            .from(schema_1.sessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sessions.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.sessions.is_valid, true)));
        // If too many sessions, invalidate the oldest ones
        if (activeSessions.length >= maxSessions) {
            // Sort by last activity
            const sortedSessions = [...activeSessions].sort((a, b) => new Date(a.last_activity).getTime() -
                new Date(b.last_activity).getTime());
            // Invalidate oldest sessions to stay under limit
            for (let i = 0; i < sortedSessions.length - maxSessions + 1; i++) {
                await client_1.db
                    .update(schema_1.sessions)
                    .set({ is_valid: false, updated_at: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema_1.sessions.id, sortedSessions[i].id));
            }
        }
        // Create new session record
        // Generate a session ID that's safe for PostgresSQL integer
        // Use a smaller, safe integer range (1 to 1,000,000)
        const sessionId = (Math.floor(Math.random() * 1000000) + 1).toString();
        await client_1.db.insert(schema_1.sessions).values({
            id: parseInt(sessionId, 10),
            user_id: userId,
            token_hash: accessTokenHash,
            refresh_token_hash: refreshTokenHash,
            expires_at: expiresAt,
            last_activity: new Date(),
            ip_address: ipAddress,
            user_agent: userAgent,
            device_info: {},
            is_valid: true,
            created_at: new Date(),
            updated_at: new Date(),
        });
        return {
            accessToken,
            refreshToken,
            sessionId,
        };
    }
    catch (error) {
        logger.error("Session creation error", error);
        throw new middlewares_1.AppError("Failed to create session", 500);
    }
}
/**
 * Invalidate a user session
 * @param {string} tokenOrSessionId - Token or session ID to invalidate
 * @param {boolean} isToken - Whether the provided value is a token or session ID
 * @returns {Promise<boolean>} - Result of invalidation operation
 */
async function invalidateSession(tokenOrSessionId, isToken = true) {
    try {
        if (isToken) {
            try {
                const decoded = await verifyToken(tokenOrSessionId);
                if (!decoded || !decoded.id) {
                    logger.warn("Invalid token during session invalidation");
                    return false;
                }
                // Find sessions associated with this token
                const userSessions = await client_1.db
                    .select()
                    .from(schema_1.sessions)
                    .where((0, drizzle_orm_1.eq)(schema_1.sessions.user_id, Number(decoded.id)));
                // Try to find the specific session by hashing the token and comparing
                let foundSession = false;
                for (const session of userSessions) {
                    if (await bcrypt.compare(tokenOrSessionId, session.token_hash)) {
                        // Invalidate this specific session
                        await client_1.db
                            .update(schema_1.sessions)
                            .set({ is_valid: false, updated_at: new Date() })
                            .where((0, drizzle_orm_1.eq)(schema_1.sessions.id, session.id));
                        foundSession = true;
                        break;
                    }
                }
                // If no specific session found, invalidate all (fallback behavior)
                if (!foundSession && userSessions.length > 0) {
                    logger.warn("Could not find specific session, invalidating all for user");
                    for (const session of userSessions) {
                        await client_1.db
                            .update(schema_1.sessions)
                            .set({ is_valid: false, updated_at: new Date() })
                            .where((0, drizzle_orm_1.eq)(schema_1.sessions.id, session.id));
                    }
                }
            }
            catch (error) {
                logger.error("Error during token verification for session invalidation", error);
                return false;
            }
        }
        else {
            // Direct session ID invalidation
            // Ensure sessionId is a valid number
            const sessionIdNum = parseInt(tokenOrSessionId, 10);
            if (isNaN(sessionIdNum)) {
                logger.warn(`Invalid session ID format: ${tokenOrSessionId}`);
                return false;
            }
            const result = await client_1.db
                .update(schema_1.sessions)
                .set({ is_valid: false, updated_at: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.sessions.id, sessionIdNum));
            if (!result) {
                logger.warn(`Session not found for ID: ${tokenOrSessionId}`);
                return false;
            }
        }
        return true;
    }
    catch (error) {
        logger.error("Session invalidation error", error);
        return false;
    }
}
/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID to update
 * @returns {Promise<boolean>} - Result of update operation
 */
async function updateSessionActivity(sessionId) {
    try {
        // Ensure sessionId is a valid number
        const sessionIdNum = parseInt(sessionId, 10);
        if (isNaN(sessionIdNum)) {
            logger.warn(`Invalid session ID format: ${sessionId}`);
            return false;
        }
        await client_1.db
            .update(schema_1.sessions)
            .set({
            last_activity: new Date(),
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.sessions.id, sessionIdNum));
        return true;
    }
    catch (error) {
        logger.error("Session activity update error", error);
        return false;
    }
}
/**
 * Send password reset email
 * @param {number} userId - User ID
 * @param {string} email - User's email address
 * @param {string} ipAddress - User's IP address
 * @returns {Promise<boolean>} - Result of operation
 */
async function sendPasswordReset(userId, email, ipAddress) {
    try {
        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);
        const expiresAt = new Date(Date.now() + parseTimeToMs("1h"));
        // Invalidate any existing password reset tokens
        await client_1.db
            .update(schema_1.password_reset_tokens)
            .set({ used: true })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.password_reset_tokens.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.password_reset_tokens.used, false)));
        // Create new password reset token
        await client_1.db.insert(schema_1.password_reset_tokens).values({
            user_id: userId,
            token_hash: tokenHash,
            expires_at: expiresAt,
            used: false,
            ip_address: ipAddress,
            created_at: new Date(),
            updated_at: new Date(),
        });
        await (0, email_service_1.sendPasswordResetEmail)(email, {
            token,
            expiresAt,
        });
        return true;
    }
    catch (error) {
        logger.error("Password reset token creation error", error);
        throw new middlewares_1.AppError("Failed to send password reset email", 500);
    }
}
/**
 * Verify email verification token
 * @param {string} token - Token to verify
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} - Result of verification
 */
async function verifyEmailToken(token, userId) {
    return await (0, client_1.withDbTransaction)(async (txDb) => {
        const tokens = await txDb
            .select()
            .from(schema_1.verification_tokens)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.verification_tokens.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.verification_tokens.type, "email"), (0, drizzle_orm_1.eq)(schema_1.verification_tokens.used, false)));
        if (!tokens.length) {
            throw new middlewares_1.AppError("Invalid verification token", 400);
        }
        let validToken = null;
        for (const dbToken of tokens) {
            try {
                if (await bcrypt.compare(token, dbToken.token_hash)) {
                    validToken = dbToken;
                    break;
                }
            }
            catch (error) {
                logger.warn("Error verifying token hash", error);
                // Continue to next token
            }
        }
        if (!validToken) {
            throw new middlewares_1.AppError("Invalid verification token", 400);
        }
        if (validToken.expires_at < new Date()) {
            throw new middlewares_1.AppError("Verification token has expired", 400);
        }
        await txDb
            .update(schema_1.verification_tokens)
            .set({ used: true, updated_at: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.verification_tokens.id, validToken.id));
        await txDb
            .update(schema_1.users)
            .set({ email_verified: true, updated_at: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        return true;
    });
}
/**
 * Reset user password
 * @param {string} token - Password reset token
 * @param {number} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Result of operation
 */
async function resetPassword(token, userId, newPassword) {
    return await (0, client_1.withDbTransaction)(async (txDb) => {
        // Verify the token first
        let validToken = null;
        const tokens = await txDb
            .select()
            .from(schema_1.password_reset_tokens)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.password_reset_tokens.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.password_reset_tokens.used, false)));
        for (const dbToken of tokens) {
            try {
                if (await bcrypt.compare(token, dbToken.token_hash)) {
                    validToken = dbToken;
                    break;
                }
            }
            catch (error) {
                logger.warn("Error verifying reset token hash during password reset", error);
                // Continue to next token
            }
        }
        if (!validToken) {
            throw new middlewares_1.AppError("Invalid password reset token", 400);
        }
        if (validToken.expires_at < new Date()) {
            throw new middlewares_1.AppError("Password reset token has expired", 400);
        }
        // Hash the new password
        const passwordHash = await hashPassword(newPassword);
        // Update the user's password
        await txDb
            .update(schema_1.users)
            .set({
            password_hash: passwordHash,
            last_password_change: new Date(),
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        // Mark the token as used
        await txDb
            .update(schema_1.password_reset_tokens)
            .set({ used: true, updated_at: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.password_reset_tokens.id, validToken.id));
        // Invalidate all existing sessions for security
        await txDb
            .update(schema_1.sessions)
            .set({ is_valid: false, updated_at: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.sessions.user_id, userId));
        return true;
    });
}
/**
 * Parse time string to milliseconds
 * @param {string} timeStr - Time string format (e.g., "30s", "15m", "24h", "7d")
 * @returns {number} - Time in milliseconds
 */
function parseTimeToMs(timeStr) {
    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error(`Invalid time format: ${timeStr}. Expected format: 30s, 15m, 24h, 7d`);
    }
    const [, value, unit] = match;
    const num = parseInt(value, 10);
    switch (unit) {
        case "s":
            return num * 1000;
        case "m":
            return num * 60 * 1000;
        case "h":
            return num * 60 * 60 * 1000;
        case "d":
            return num * 24 * 60 * 60 * 1000;
        default:
            throw new Error(`Unknown time unit: ${unit}`);
    }
}
