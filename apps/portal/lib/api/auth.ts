import { trpc } from './trpc';
import { toast } from 'sonner';

export type {
    SignupInput,
    LoginInput,
    RequestPasswordResetInput,
    ResetPasswordInput,
    VerifyEmailInput,
} from '@workspace/api/src/modules/auth';

// Auth API wrapper
export const authApi = {
    // Login user
    login: async (email: string, password: string) => {
        try {
            const result = await trpc.auth.login.mutate({ email, password });

            if (result.data?.requiresTwoFactor) {
                return {
                    success: false,
                    requiresTwoFactor: true,
                    twoFactorMethod: result.data.twoFactorMethod,
                    tempToken: result.data.tempToken,
                };
            }

            if (result.success && result.data?.user) {
                return {
                    success: true,
                    user: result.data.user,
                };
            }

            return { success: false, message: result.message };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to log in. Please try again.';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },

    // Register new user
    register: async (name: string, email: string, password: string) => {
        try {
            const result = await trpc.auth.signup.mutate({ name, email, password });

            if (result.success) {
                toast.success(result.message || 'Registration successful. Please check your email to verify your account.');
                return { success: true };
            }

            return { success: false, message: result.message };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to register. Please try again.';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },

    // Request password reset
    requestPasswordReset: async (email: string) => {
        try {
            const result = await trpc.auth.requestPasswordReset.mutate({ email });

            if (result.success) {
                toast.success(result.message || 'If your email is registered, you will receive reset instructions shortly.');
                return { success: true };
            }

            return { success: false, message: result.message };
        } catch (error: any) {
            // Always show the same message for security reasons
            toast.success('If your email is registered, you will receive reset instructions shortly.');
            return { success: true };
        }
    },

    // Reset password with token
    resetPassword: async (token: string, password: string, confirmPassword: string) => {
        try {
            // Check if passwords match before making the API call
            if (password !== confirmPassword) {
                toast.error('Passwords do not match');
                return { success: false, message: 'Passwords do not match' };
            }

            const result = await trpc.auth.resetPassword.mutate({ token, password, confirmPassword });

            if (result.success) {
                toast.success(result.message || 'Password has been reset successfully.');
                return { success: true };
            }

            return { success: false, message: result.message };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to reset password. Please try again.';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },

    // Verify email with token
    verifyEmail: async (token: string) => {
        try {
            const result = await trpc.auth.verifyEmail.mutate({ token });

            if (result.success) {
                toast.success(result.message || 'Email verified successfully. You can now log in to your account.');
                return { success: true };
            }

            return { success: false, message: result.message };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to verify email. Please try again.';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },

    // Verify two-factor authentication
    verifyTwoFactor: async (token: string, code: string) => {
        try {
            const result = await trpc.auth.verifyTwoFactor.mutate({ token, code });

            if (result.success && result.data?.user) {
                return {
                    success: true,
                    user: result.data.user,
                };
            }

            return { success: false, message: result.message };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to verify code. Please try again.';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },

    // Logout user
    logout: async () => {
        try {
            const result = await trpc.auth.logout.mutate();

            if (result.success) {
                return { success: true };
            }

            return { success: false, message: result.message };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to log out. Please try again.';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const result = await trpc.auth.me.query();

            if (result.success && result.data?.user) {
                return {
                    success: true,
                    user: result.data.user,
                };
            }

            return { success: false };
        } catch (error: any) {
            return { success: false };
        }
    },
};