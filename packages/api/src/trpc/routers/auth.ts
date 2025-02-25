import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, procedure, publicProcedure } from '../trpc';
import {
    signupSchema,
    loginSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from '../../modules/auth';
import {
    createUser,
    authenticateUser,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyEmail
} from '../../modules/auth';
import { AUTH } from '../../config';
import { protectedProcedure } from '../../modules/auth';

export const authRouter = router({
    /**
     * Register a new user
     */
    signup: publicProcedure
        .input(signupSchema)
        .mutation(async ({ input }) => {
            try {
                const result = await createUser(input);

                return {
                    success: true,
                    userId: result.userId,
                    message: 'Account created successfully. Please check your email to verify your account.',
                };
            } catch (error: unknown) {
                // Type-guard for error
                if (error instanceof Error) {
                    if (error.message === 'Email already in use') {
                        throw new TRPCError({
                            code: 'CONFLICT',
                            message: 'This email is already registered',
                        });
                    }
                }

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create account',
                    cause: error,
                });
            }
        }),

    /**
     * Login with email and password
     */
    login: publicProcedure
        .input(loginSchema)
        .mutation(async ({ input, ctx }) => {
            // Get client information
            const userAgent = ctx.req.headers.get('user-agent') || 'unknown';
            const ip = ctx.req.headers.get('x-forwarded-for') ||
                ctx.req.headers.get('cf-connecting-ip') ||
                'unknown';

            const result = await authenticateUser(input, ip, userAgent);

            if (!result) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid email or password',
                });
            }

            // Set HTTP-only cookie with the PASETO token
            ctx.resHeaders.append('Set-Cookie', `auth_token=${result.token}; HttpOnly; Path=/; Max-Age=${AUTH.TOKEN_EXPIRY}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

            return {
                success: true,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                },
            };
        }),

    /**
     * Logout the current user
     */
    logout: protectedProcedure
        .mutation(async ({ ctx }) => {
            // Extract token from auth header or cookie
            const authHeader = ctx.req.headers.get('authorization');
            const token = authHeader?.startsWith('Bearer ')
                ? authHeader.substring(7)
                : undefined;

            // If no token in header, try cookie
            const cookieHeader = ctx.req.headers.get('cookie') || '';
            const cookies = Object.fromEntries(
                cookieHeader.split('; ').map(c => {
                    const [key, ...value] = c.split('=');
                    return [key, value.join('=')];
                })
            );

            const cookieToken = cookies.auth_token;

            const tokenToInvalidate = token || cookieToken;

            if (!tokenToInvalidate) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No session token found',
                });
            }

            await logout(tokenToInvalidate);

            // Clear cookie
            ctx.resHeaders.append('Set-Cookie', 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');

            return {
                success: true,
                message: 'Logged out successfully',
            };
        }),

    /**
     * Get current user information
     */
    me: protectedProcedure
        .query(({ ctx }) => {
            return {
                user: ctx.user,
            };
        }),

    /**
     * Request password reset
     */
    requestPasswordReset: publicProcedure
        .input(requestPasswordResetSchema)
        .mutation(async ({ input, ctx }) => {
            const ip = ctx.req.headers.get('x-forwarded-for') ||
                ctx.req.headers.get('cf-connecting-ip') ||
                'unknown';

            await requestPasswordReset(input, ip);

            // Always return success to prevent email enumeration
            return {
                success: true,
                message: 'If your email is registered, you will receive reset instructions shortly.',
            };
        }),

    /**
     * Reset password with token
     */
    resetPassword: publicProcedure
        .input(resetPasswordSchema)
        .mutation(async ({ input }) => {
            const success = await resetPassword(input);

            if (!success) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid or expired reset token',
                });
            }

            return {
                success: true,
                message: 'Password has been reset successfully. You can now log in with your new password.',
            };
        }),

    /**
     * Verify email address
     */
    verifyEmail: publicProcedure
        .input(verifyEmailSchema)
        .mutation(async ({ input }) => {
            const success = await verifyEmail(input.token);

            if (!success) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid or expired verification token',
                });
            }

            return {
                success: true,
                message: 'Email verified successfully. You can now log in to your account.',
            };
        }),
});