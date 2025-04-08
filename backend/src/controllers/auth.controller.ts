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
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
export const refreshToken = async (req: Request, res: Response) => {
    try {
        // Get refresh token from cookie or body
        const refreshToken = req.cookies?.[constants.REFRESH_COOKIE_NAME] || req.body.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = await authService.verifyToken(refreshToken);

            // Check if token type is refresh
            if (decoded.type !== constants.TOKEN_TYPES.REFRESH) {
                throw new Error('Invalid token type');
            }
        } catch (error) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: constants.ERROR_MESSAGES.INVALID_TOKEN
            });
        }

        // Get user
        const user = await userService.getUserById(decoded.id);

        // Create new session and tokens
        const { accessToken, refreshToken: newRefreshToken } = await authService.createSession(
            BigInt(user.id),
            req.ip || 'unknown',
            req.headers['user-agent'] || 'unknown'
        );

        // Set cookies
        res.cookie(constants.AUTH_COOKIE_NAME, accessToken, constants.COOKIE_OPTIONS);
        res.cookie(constants.REFRESH_COOKIE_NAME, newRefreshToken, constants.COOKIE_OPTIONS);

        res.status(200).json({
            message: 'Token refreshed successfully',
            token: accessToken
        });
    } catch (error) {
        logger.error('Token refresh error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'Token Refresh Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Token Refresh Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: constants.ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        // Get user details
        const user = await userService.getUserById(req.user.id);

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                base_role: user.base_role,
                avatar_url: user.avatar_url,
                email_verified: user.email_verified
            }
        });
    } catch (error) {
        logger.error('Get current user error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'Authentication Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Authentication Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};/**
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            // Get user by email
            let user;
            try {
                user = await userService.getUserByEmail(email);
            } catch (error) {
                // We return success even if the email is not found for security reasons
                return res.status(200).json({
                    message: constants.SUCCESS_MESSAGES.PASSWORD_RESET_SENT
                });
            }

            // Send password reset email
            await authService.sendPasswordReset(
                BigInt(user.id),
                user.email,
                req.ip || 'unknown'
            );

            res.status(200).json({
                message: constants.SUCCESS_MESSAGES.PASSWORD_RESET_SENT
            });
        } catch (error) {
            logger.error('Forgot password error', error);
            res.status(500).json({
                error: 'Password Reset Error',
                message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            });
        }
    };

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
 *         description: Invalid token or passwords don't match
 *       500:
 *         description: Server error
 */
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        // Decode token to get user ID
        let decoded;
        try {
            decoded = await authService.verifyToken(token);
        } catch (error) {
            throw new AppError(constants.ERROR_MESSAGES.INVALID_TOKEN, 400);
        }

        // Reset the password
        await authService.resetPassword(token, BigInt(decoded.id), password);

        res.status(200).json({
            message: constants.SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS
        });
    } catch (error) {
        logger.error('Password reset error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'Password Reset Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Password Reset Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};/**
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
export const logout = async (req: Request, res: Response) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: constants.ERROR_MESSAGES.UNAUTHORIZED
                });
            }

            // Get token from cookie or header
            const token = req.cookies?.[constants.AUTH_COOKIE_NAME] ||
                (req.headers.authorization?.startsWith('Bearer ') ?
                    req.headers.authorization.substring(7) : null);

            if (token) {
                // Invalidate the session
                await authService.invalidateSession(token);
            }

            // Clear cookies
            res.clearCookie(constants.AUTH_COOKIE_NAME);
            res.clearCookie(constants.REFRESH_COOKIE_NAME);

            res.status(200).json({
                message: constants.SUCCESS_MESSAGES.LOGOUT_SUCCESS
            });
        } catch (error) {
            logger.error('Logout error', error);
            res.status(500).json({
                error: 'Logout Error',
                message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            });
        }
    };

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
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        // Decode token to get user ID
        let decoded;
        try {
            decoded = await authService.verifyToken(token);
        } catch (error) {
            throw new AppError(constants.ERROR_MESSAGES.INVALID_TOKEN, 400);
        }

        // Verify the email
        await authService.verifyEmailToken(token, BigInt(decoded.id));

        res.status(200).json({
            message: constants.SUCCESS_MESSAGES.EMAIL_VERIFIED
        });
    } catch (error) {
        logger.error('Email verification error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'Verification Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Verification Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};import { Request, Response } from 'express';
import { authService, userService } from '../services';
import { AppError } from '../middlewares';
import { constants, Logger } from '../config';

const logger = new Logger('AuthController');

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
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Create user with applicant base role by default
        const user = await userService.createUser({
            email,
            password,
            name,
            base_role: 'applicant',
            sendVerificationEmail: true
        });

        res.status(201).json({
            message: constants.SUCCESS_MESSAGES.USER_CREATED,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                email_verified: user.email_verified
            }
        });
    } catch (error) {
        logger.error('Registration error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'Registration Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Registration Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

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
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, remember_me = false } = req.body;

        // Get user by email
        let user;
        try {
            user = await userService.getUserByEmail(email);
        } catch (error) {
            throw new AppError(constants.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }

        // Verify password
        const passwordValid = await authService.verifyPassword(password, user.password_hash);
        if (!passwordValid) {
            throw new AppError(constants.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }

        // Check if account is active
        if (!user.is_active) {
            throw new AppError(constants.ERROR_MESSAGES.ACCOUNT_LOCKED, 401);
        }

        // Check if email is verified (optional, depending on your requirements)
        if (!user.email_verified) {
            // You could either prevent login or just warn the user
            // For now, we'll just continue but add a flag in the response
        }

        // Create session and tokens
        const { accessToken, refreshToken } = await authService.createSession(
            BigInt(user.id),
            req.ip || 'unknown',
            req.headers['user-agent'] || 'unknown'
        );

        // Set cookies
        const cookieOptions = {
            ...constants.COOKIE_OPTIONS,
            maxAge: remember_me
                ? 7 * 24 * 60 * 60 * 1000  // 7 days for "remember me"
                : 24 * 60 * 60 * 1000      // 1 day default
        };

        res.cookie(constants.AUTH_COOKIE_NAME, accessToken, cookieOptions);
        res.cookie(constants.REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

        // Update last login time
        await userService.updateUser(user.id, {
            last_login: new Date()
        });

        // Return success with user info
        res.status(200).json({
            message: constants.SUCCESS_MESSAGES.LOGIN_SUCCESS,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                base_role: user.base_role,
                email_verified: user.email_verified
            },
            email_verified: user.email_verified,
            // Include token in response for Swagger UI testing
            token: accessToken
        });
    } catch (error) {
        logger.error('Login error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'Authentication Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Authentication Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};