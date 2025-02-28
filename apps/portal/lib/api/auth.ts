import { trpcClient } from './trpc';
import { apiCall } from './base';
import type { ApiResponse } from './base';

// Re-export types from the API
export type {
    SignupInput,
    LoginInput,
    RequestPasswordResetInput,
    ResetPasswordInput,
    VerifyEmailInput,
    SetupTotpInput,
    VerifyTotpInput
} from '@workspace/api/src/modules/auth/schema';

export type { ApiResponse };

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions?: string[];
}

export interface AuthResponse {
    user?: User;
    requiresTwoFactor?: boolean;
    twoFactorMethod?: string;
    tempToken?: string;
}

/**
 * Register a new user
 */
export async function signup(input: {
    email: string;
    password: string;
    name: string;
}): Promise<ApiResponse<{ userId: string }>> {
    return apiCall(
        () => trpcClient.auth.signup.mutate(input),
        {
            successMessage: 'Account created successfully. Please check your email to verify your account.',
        }
    );
}

/**
 * Log in a user
 */
export async function login(input: {
    email: string;
    password: string;
    totpCode?: string;
}): Promise<ApiResponse<AuthResponse>> {
    return apiCall(
        () => trpcClient.auth.login.mutate(input),
        {
            showSuccessToast: false, // We'll handle success messages specifically based on 2FA
            queryKey: 'currentUser',
        }
    );
}

/**
 * Verify two-factor authentication
 */
export async function verifyTwoFactor(input: {
    token: string;
    totpCode: string;
}): Promise<ApiResponse<AuthResponse>> {
    return apiCall(
        () => trpcClient.auth.verifyTwoFactor.mutate({
            token: input.token,
            code: input.totpCode  // Rename totpCode to code for the API call
        }),
        {
            successMessage: 'Login successful',
            queryKey: 'currentUser',
        }
    );
}

/**
 * Log out the current user
 */
export async function logout(): Promise<ApiResponse<void>> {
    return apiCall(
        () => trpcClient.auth.logout.mutate(),
        {
            successMessage: 'Logged out successfully',
            queryKey: 'currentUser',
        }
    );
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
    return apiCall(
        () => trpcClient.auth.me.query(),
        {
            showSuccessToast: false,
        }
    );
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(input: {
    email: string;
}): Promise<ApiResponse<void>> {
    return apiCall(
        () => trpcClient.auth.requestPasswordReset.mutate(input),
        {
            successMessage: 'If your email is registered, you will receive reset instructions shortly.',
        }
    );
}

/**
 * Reset password with token
 */
export async function resetPassword(input: {
    token: string;
    password: string;
    confirmPassword: string;
}): Promise<ApiResponse<void>> {
    return apiCall(
        () => trpcClient.auth.resetPassword.mutate(input),
        {
            successMessage: 'Password has been reset successfully. You can now log in with your new password.',
        }
    );
}

/**
 * Verify email address
 */
export async function verifyEmail(input: {
    token: string;
}): Promise<ApiResponse<void>> {
    return apiCall(
        () => trpcClient.auth.verifyEmail.mutate(input),
        {
            successMessage: 'Email verified successfully. You can now log in to your account.',
        }
    );
}

/**
 * Setup two-factor authentication
 */
export async function setupTwoFactor(): Promise<ApiResponse<{
    qrCodeUrl: string;
    secret: string;
}>> {
    return apiCall(
        () => trpcClient.auth.setupTwoFactor.mutate(),
        {
            successMessage: 'Two-factor authentication setup initiated',
        }
    );
}

/**
 * Verify and activate two-factor authentication
 */
export async function verifyTwoFactorSetup(input: {
    totpCode: string;
}): Promise<ApiResponse<void>> {
    return apiCall(
        () => trpcClient.auth.verifyTwoFactorSetup.mutate(input),
        {
            successMessage: 'Two-factor authentication enabled successfully',
            queryKey: 'currentUser',
        }
    );
}

/**
 * Disable two-factor authentication
 */
export async function disableTwoFactor(): Promise<ApiResponse<void>> {
    return apiCall(
        () => trpcClient.auth.disableTwoFactor.mutate(),
        {
            successMessage: 'Two-factor authentication disabled successfully',
            queryKey: 'currentUser',
        }
    );
}