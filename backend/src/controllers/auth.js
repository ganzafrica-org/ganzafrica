"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.logout = exports.resetPassword = exports.forgotPassword = exports.getCurrentUser = exports.refreshToken = exports.login = exports.register = void 0;
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const client_1 = require("../db/client");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const logger = new config_1.Logger("AuthController");
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirm_password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               confirm_password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Check if email already exists
        try {
            const existingUser = await services_1.userService.getUserByEmail(email);
            if (existingUser) {
                throw new middlewares_1.AppError("Email already in use", 400);
            }
        }
        catch (error) {
            // If error is "user not found", that's what we want
            if (!(error instanceof middlewares_1.AppError && error.statusCode === 404)) {
                throw error;
            }
        }
        try {
            // First, get a default role for new users
            let defaultRoleId;
            try {
                // First try to find a role with name "public"
                const publicRole = await client_1.db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.name, "public")).limit(1);
                if (publicRole && publicRole.length > 0) {
                    defaultRoleId = publicRole[0].id;
                    logger.info(`Using public role with ID: ${defaultRoleId}`);
                }
                else {
                    // If no "public" role, get the first available role
                    const anyRole = await client_1.db.select().from(schema_1.roles).limit(1);
                    if (!anyRole || anyRole.length === 0) {
                        throw new middlewares_1.AppError("No roles found in the database. Database setup may be incomplete.", 500);
                    }
                    defaultRoleId = anyRole[0].id;
                    logger.info(`Public role not found. Using alternate role with ID: ${defaultRoleId}`);
                }
            }
            catch (roleError) {
                logger.error("Error accessing roles table:", roleError);
                throw new middlewares_1.AppError("Failed to assign a role to the new user. Database setup may be incomplete.", 500);
            }
            // Insert the user WITH the default role_id
            const user = await client_1.db.transaction(async (tx) => {
                // Hash the password first
                const passwordHash = await services_1.authService.hashPassword(password);
                // Use Drizzle ORM's insert method instead of raw SQL
                // This ensures proper escaping of all values including the password hash
                const result = await tx.insert(schema_1.users).values({
                    email: email,
                    password_hash: passwordHash,
                    name: name,
                    role_id: defaultRoleId,
                    is_active: true,
                    email_verified: false,
                    phone_verified: false,
                    account_locked: false,
                    failed_login_attempts: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                }).returning();
                // Return the created user
                return result[0];
            });
            // Send welcome email after successful user creation
            try {
                await services_1.emailService.sendWelcomeEmail(email, name);
                logger.info(`Welcome email sent successfully to ${email}`);
            }
            catch (emailError) {
                logger.error("Failed to send welcome email", emailError);
                // Don't block registration if email fails
            }
            res.status(201).json({
                message: config_1.constants.SUCCESS_MESSAGES.USER_CREATED,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    email_verified: user.email_verified
                }
            });
        }
        catch (dbError) {
            logger.error("Database error during user creation:", dbError);
            throw new middlewares_1.AppError("Failed to create user", 500);
        }
    }
    catch (error) {
        logger.error("Registration error", error);
        handleErrorResponse(error, res, "Registration Error");
    }
};
exports.register = register;
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               remember_me:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const login = async (req, res) => {
    try {
        const { email, password, remember_me = false } = req.body;
        // Validate required fields
        if (!email || !password) {
            throw new middlewares_1.AppError("Email and password are required", 400);
        }
        // Get user by email
        let user;
        try {
            user = await services_1.userService.getUserByEmail(email);
        }
        catch (error) {
            throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }
        // Verify password
        const passwordValid = await services_1.authService.verifyPassword(password, user.password_hash);
        if (!passwordValid) {
            // Optionally implement login attempt tracking
            // await userService.incrementLoginAttempts(user.id);
            throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }
        // Check account status
        if (!user.is_active) {
            throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.ACCOUNT_INACTIVE || "Account is inactive", 401);
        }
        // Create session and tokens using JWT
        const { accessToken, refreshToken } = await services_1.authService.createSession(user.id, req.ip || "unknown", req.headers["user-agent"] || "unknown");
        // Set cookies
        const cookieOptions = {
            ...config_1.constants.COOKIE_OPTIONS,
            maxAge: remember_me ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
        };
        res.cookie(config_1.constants.AUTH_COOKIE_NAME, accessToken, cookieOptions);
        res.cookie(config_1.constants.REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
        // Return success with user info and token
        res.status(200).json({
            message: config_1.constants.SUCCESS_MESSAGES.LOGIN_SUCCESS,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                email_verified: user.email_verified,
                avatar_url: user.avatar_url,
            },
            token: accessToken,
        });
    }
    catch (error) {
        logger.error("Login error", error);
        handleErrorResponse(error, res, "Authentication Error");
    }
};
exports.login = login;
/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const refreshToken = async (req, res) => {
    try {
        // Get refresh token from cookie or body
        const refreshToken = req.cookies?.[config_1.constants.REFRESH_COOKIE_NAME] || req.body.refresh_token;
        if (!refreshToken) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Refresh token is required",
            });
            return;
        }
        // Verify refresh token
        let decoded;
        try {
            decoded = await services_1.authService.verifyToken(refreshToken, true); // true indicates refresh token
            // Check if token type is refresh
            if (decoded.type !== config_1.constants.TOKEN_TYPES.REFRESH) {
                throw new Error("Invalid token type");
            }
        }
        catch (error) {
            // Clear cookies on invalid token
            res.clearCookie(config_1.constants.AUTH_COOKIE_NAME, config_1.constants.COOKIE_OPTIONS);
            res.clearCookie(config_1.constants.REFRESH_COOKIE_NAME, config_1.constants.COOKIE_OPTIONS);
            res.status(401).json({
                error: "Unauthorized",
                message: config_1.constants.ERROR_MESSAGES.INVALID_TOKEN,
            });
            return;
        }
        // Get user
        let user;
        try {
            user = await services_1.userService.getUserById(Number(decoded.id));
        }
        catch (error) {
            throw new middlewares_1.AppError("User not found", 404);
        }
        // Verify account status
        if (!user.is_active) {
            throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.ACCOUNT_INACTIVE || "Account is inactive", 401);
        }
        // Create new session and tokens
        const { accessToken, refreshToken: newRefreshToken } = await services_1.authService.createSession(user.id, req.ip || "unknown", req.headers["user-agent"] || "unknown");
        // Set cookies
        res.cookie(config_1.constants.AUTH_COOKIE_NAME, accessToken, config_1.constants.COOKIE_OPTIONS);
        res.cookie(config_1.constants.REFRESH_COOKIE_NAME, newRefreshToken, config_1.constants.COOKIE_OPTIONS);
        res.status(200).json({
            message: "Token refreshed successfully",
            token: accessToken,
        });
    }
    catch (error) {
        logger.error("Token refresh error", error);
        handleErrorResponse(error, res, "Token Refresh Error");
    }
};
exports.refreshToken = refreshToken;
const getCurrentUser = async (req, res) => {
    try {
        // Check if user is authenticated - this is set by the authenticate middleware
        if (!req.user) {
            res.status(401).json({
                error: "Unauthorized",
                message: config_1.constants.ERROR_MESSAGES.UNAUTHORIZED,
            });
            return;
        }
        // User information is already loaded in req.user by the authenticate middleware
        // We can directly use it without fetching from the database again
        // Update session activity timestamp if we have session ID
        if (req.sessionId) {
            try {
                await services_1.authService.updateSessionActivity(req.sessionId);
            }
            catch (sessionError) {
                // Log but don't fail the request if session update fails
                logger.warn('Failed to update session activity', sessionError);
            }
        }
        // Return user information
        res.status(200).json({
            user: {
                id: parseInt(req.user.id),
                email: req.user.email,
                name: req.user.name,
                email_verified: req.user.email_verified
            },
        });
    }
    catch (error) {
        logger.error("Get current user error", error);
        handleErrorResponse(error, res, "Authentication Error");
    }
};
exports.getCurrentUser = getCurrentUser;
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new middlewares_1.AppError("Email is required", 400);
        }
        // Get user by email
        let user;
        try {
            user = await services_1.userService.getUserByEmail(email);
        }
        catch (error) {
            // We return success even if the email is not found for security reasons
            res.status(200).json({
                message: config_1.constants.SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
            });
            return;
        }
        // Check if user account is active
        if (!user.is_active) {
            // Still return success for security reasons
            res.status(200).json({
                message: config_1.constants.SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
            });
            return;
        }
        // Send password reset email
        await services_1.authService.sendPasswordReset(user.id, user.email, req.ip || "unknown");
        res.status(200).json({
            message: config_1.constants.SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
        });
    }
    catch (error) {
        logger.error("Forgot password error", error);
        handleErrorResponse(error, res, "Password Reset Error");
    }
};
exports.forgotPassword = forgotPassword;
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirm_password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *               confirm_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
const resetPassword = async (req, res) => {
    try {
        const { token, password, confirm_password } = req.body;
        if (!token || !password) {
            throw new middlewares_1.AppError("Token and password are required", 400);
        }
        if (password !== confirm_password) {
            throw new middlewares_1.AppError("Passwords do not match", 400);
        }
        // Verify token and get user ID
        let decoded;
        try {
            decoded = await services_1.authService.verifyToken(token);
        }
        catch (error) {
            throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.INVALID_TOKEN, 400);
        }
        // Reset the password
        await services_1.authService.resetPassword(token, Number(decoded.id), password);
        res.status(200).json({
            message: config_1.constants.SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
        });
    }
    catch (error) {
        logger.error("Password reset error", error);
        handleErrorResponse(error, res, "Password Reset Error");
    }
};
exports.resetPassword = resetPassword;
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const logout = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({
                error: "Unauthorized",
                message: config_1.constants.ERROR_MESSAGES.UNAUTHORIZED,
            });
            return;
        }
        // Get token from cookie or header
        const token = req.cookies?.[config_1.constants.AUTH_COOKIE_NAME] ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.substring(7)
                : null);
        if (token) {
            // Invalidate the session
            await services_1.authService.invalidateSession(token);
        }
        // Clear cookies
        res.clearCookie(config_1.constants.AUTH_COOKIE_NAME);
        res.clearCookie(config_1.constants.REFRESH_COOKIE_NAME);
        res.status(200).json({
            message: config_1.constants.SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        });
    }
    catch (error) {
        logger.error("Logout error", error);
        handleErrorResponse(error, res, "Logout Error");
    }
};
exports.logout = logout;
/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            throw new middlewares_1.AppError("Token is required", 400);
        }
        // Decode token to get user ID
        let decoded;
        try {
            decoded = await services_1.authService.verifyToken(token);
        }
        catch (error) {
            throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.INVALID_TOKEN, 400);
        }
        // Verify the email
        await services_1.authService.verifyEmailToken(token, Number(decoded.id));
        res.status(200).json({
            message: config_1.constants.SUCCESS_MESSAGES.EMAIL_VERIFIED,
        });
    }
    catch (error) {
        logger.error("Email verification error", error);
        handleErrorResponse(error, res, "Verification Error");
    }
};
exports.verifyEmail = verifyEmail;
/**
 * Helper function to handle error responses consistently
 * @param {unknown} error - The error object
 * @param {Response} res - Express response object
 * @param {string} errorType - Type of error for the response
 */
function handleErrorResponse(error, res, errorType) {
    if (error instanceof middlewares_1.AppError) {
        res.status(error.statusCode).json({
            error: errorType,
            message: error.message,
        });
    }
    else {
        res.status(500).json({
            error: errorType,
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
}
