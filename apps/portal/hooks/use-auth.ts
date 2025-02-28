import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import * as authApi from '@/lib/api/auth';
import type { User, AuthResponse } from '@/lib/api/auth';
import type { ApiResponse } from '@/lib/api/base';

// Types for the hook return values
export interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: Error | null;
    login: (data: authApi.LoginInput) => Promise<ApiResponse<AuthResponse>>;
    logout: () => Promise<void>;
    signup: (data: authApi.SignupInput) => Promise<ApiResponse<{ userId: string }>>;
    requestPasswordReset: (email: string) => Promise<ApiResponse<void>>;
    resetPassword: (data: authApi.ResetPasswordInput) => Promise<ApiResponse<void>>;
    verifyEmail: (token: string) => Promise<ApiResponse<void>>;
    verifyTwoFactor: (token: string, code: string) => Promise<ApiResponse<AuthResponse>>;
    setupTwoFactor: () => Promise<ApiResponse<{ qrCodeUrl: string; secret: string; }>>;
    verifyTwoFactorSetup: (code: string) => Promise<ApiResponse<void>>;
    disableTwoFactor: () => Promise<ApiResponse<void>>;
    requiresTwoFactor: boolean;
    twoFactorMethod?: string;
    tempToken?: string;
}

/**
 * Hook that provides authentication functionality
 */
export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState<string | undefined>(undefined);
    const [tempToken, setTempToken] = useState<string | undefined>(undefined);

    // Query to get the current user
    const {
        data: userData,
        isLoading: isUserLoading,
        error: userError,
        refetch: refetchUser,
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await authApi.getCurrentUser();
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (data: authApi.LoginInput) => {
            return authApi.login(data);
        },
        onSuccess: (response) => {
            if (response.success && response.data) {
                if (response.data.requiresTwoFactor) {
                    // Handle 2FA
                    setRequiresTwoFactor(true);
                    setTwoFactorMethod(response.data.twoFactorMethod);
                    setTempToken(response.data.tempToken);
                    toast.info('Please complete two-factor authentication to log in');
                } else if (response.data.user) {
                    // Successful login without 2FA
                    setRequiresTwoFactor(false);
                    setTwoFactorMethod(undefined);
                    setTempToken(undefined);

                    // Update the user cache
                    queryClient.setQueryData(['currentUser'], response.data.user);
                    toast.success('Login successful');
                }
            }
        },
    });

    // Verify two-factor authentication mutation
    const verifyTwoFactorMutation = useMutation({
        mutationFn: async ({ token, code }: { token: string; code: string }) => {
            return authApi.verifyTwoFactor({ token, totpCode: code });
        },
        onSuccess: (response) => {
            if (response.success && response.data?.user) {
                setRequiresTwoFactor(false);
                setTwoFactorMethod(undefined);
                setTempToken(undefined);

                // Update the user cache
                queryClient.setQueryData(['currentUser'], response.data.user);
            }
        },
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            // Clear the user cache
            queryClient.setQueryData(['currentUser'], null);
            router.push('/login');
        },
    });

    // Signup mutation
    const signupMutation = useMutation({
        mutationFn: authApi.signup,
    });

    // Request password reset mutation
    const requestPasswordResetMutation = useMutation({
        mutationFn: (email: string) => authApi.requestPasswordReset({ email }),
    });

    // Reset password mutation
    const resetPasswordMutation = useMutation({
        mutationFn: authApi.resetPassword,
        onSuccess: () => {
            router.push('/login');
        },
    });

    // Verify email mutation
    const verifyEmailMutation = useMutation({
        mutationFn: (token: string) => authApi.verifyEmail({ token }),
        onSuccess: () => {
            router.push('/login');
        },
    });

    // Setup two-factor authentication mutation
    const setupTwoFactorMutation = useMutation({
        mutationFn: authApi.setupTwoFactor,
    });

    // Verify and activate two-factor authentication mutation
    const verifyTwoFactorSetupMutation = useMutation({
        mutationFn: (totpCode: string) => authApi.verifyTwoFactorSetup({ totpCode }),
        onSuccess: () => {
            refetchUser();
        },
    });

    // Disable two-factor authentication mutation
    const disableTwoFactorMutation = useMutation({
        mutationFn: authApi.disableTwoFactor,
        onSuccess: () => {
            refetchUser();
        },
    });

    // Wrapped functions
    const login = useCallback(
        async (data: authApi.LoginInput) => {
            return loginMutation.mutateAsync(data);
        },
        [loginMutation]
    );

    const logout = useCallback(async () => {
        await logoutMutation.mutateAsync();
    }, [logoutMutation]);

    const signup = useCallback(
        async (data: authApi.SignupInput) => {
            return signupMutation.mutateAsync(data);
        },
        [signupMutation]
    );

    const requestPasswordReset = useCallback(
        async (email: string) => {
            return requestPasswordResetMutation.mutateAsync(email);
        },
        [requestPasswordResetMutation]
    );

    const resetPassword = useCallback(
        async (data: authApi.ResetPasswordInput) => {
            return resetPasswordMutation.mutateAsync(data);
        },
        [resetPasswordMutation]
    );

    const verifyEmail = useCallback(
        async (token: string) => {
            return verifyEmailMutation.mutateAsync(token);
        },
        [verifyEmailMutation]
    );

    const verifyTwoFactor = useCallback(
        async (token: string, code: string) => {
            return verifyTwoFactorMutation.mutateAsync({ token, code });
        },
        [verifyTwoFactorMutation]
    );

    const setupTwoFactor = useCallback(async () => {
        return setupTwoFactorMutation.mutateAsync();
    }, [setupTwoFactorMutation]);

    const verifyTwoFactorSetup = useCallback(
        async (code: string) => {
            return verifyTwoFactorSetupMutation.mutateAsync(code);
        },
        [verifyTwoFactorSetupMutation]
    );

    const disableTwoFactor = useCallback(async () => {
        return disableTwoFactorMutation.mutateAsync();
    }, [disableTwoFactorMutation]);

    return {
        user: userData || null,
        isLoading: isUserLoading ||
            loginMutation.isPending ||
            logoutMutation.isPending,
        isAuthenticated: !!userData,
        error: userError as Error | null,
        login,
        logout,
        signup,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        verifyTwoFactor,
        setupTwoFactor,
        verifyTwoFactorSetup,
        disableTwoFactor,
        requiresTwoFactor,
        twoFactorMethod,
        tempToken,
    };
}