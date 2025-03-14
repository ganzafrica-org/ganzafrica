import { z } from 'zod';


// These should match the values in AUTH config
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validation schema for user registration
 */
export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    name: z.string().min(1, 'Name is required'),
});

/**
 * Validation schema for user login
 */
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    totpCode: z.string().optional(),
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
    password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

/**
 * Validation schema for email verification
 */
export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Verification token is required'),
});

/**
 * Validation schema for setting up TOTP
 */
export const setupTotpSchema = z.object({
    totpCode: z.string().min(6, 'TOTP code must be at least 6 characters'),
});

/**
 * Validation schema for verifying TOTP during login
 */
export const verifyTotpSchema = z.object({
    totpCode: z.string().min(6, 'TOTP code must be at least 6 characters'),
    token: z.string().min(1, 'Temporary token is required'),
});

// Type exports for schema
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type SetupTotpInput = z.infer<typeof setupTotpSchema>;
export type VerifyTotpInput = z.infer<typeof verifyTotpSchema>;