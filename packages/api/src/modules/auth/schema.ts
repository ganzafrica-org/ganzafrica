import { z } from 'zod';
import { AUTH } from '../../config';

/**
 * Validation schema for user registration
 */
export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(
        AUTH.MINIMUM_PASSWORD_LENGTH,
        `Password must be at least ${AUTH.MINIMUM_PASSWORD_LENGTH} characters`
    ),
    name: z.string().min(1, 'Name is required'),
});

/**
 * Validation schema for user login
 */
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

/**
 * Validation schema for password reset request
 */
export const requestPasswordResetSchema = z.object({
    email: z.string().email('Invalid email address'),
});

/**
 * Validation schema for password reset
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(
        AUTH.MINIMUM_PASSWORD_LENGTH,
        `Password must be at least ${AUTH.MINIMUM_PASSWORD_LENGTH} characters`
    ),
});

// Type exports for schema
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;