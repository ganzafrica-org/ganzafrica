'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api/trpc';

// Import schemas directly in the provider (not exported to components)
import {
    signupSchema,
    loginSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    setupTotpSchema,
    verifyTotpSchema
} from '@workspace/api/src/modules/auth/schema';

// Types for the auth context
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions?: string[];
}

export interface AuthContextType {
    // State
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    requiresTwoFactor: boolean;
    twoFactorMethod?: string;
    tempToken?: string;

    // Auth methods
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<boolean>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    verifyTwoFactor: (code: string) => Promise<boolean>;
    requestPasswordReset: (email: string) => Promise<boolean>;
    resetPassword: (token: string, password: string, confirmPassword: string) => Promise<boolean>;
    verifyEmail: (token: string) => Promise<boolean>;
    setupTwoFactor: () => Promise<{ qrCodeUrl: string; secret: string } | null>;
    verifyTwoFactorSetup: (code: string) => Promise<boolean>;
    disableTwoFactor: () => Promise<boolean>;
}

// Error handler function
function handleApiError(error: unknown): string {
    console.error('API Error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
    }

    toast.error(errorMessage);
    return errorMessage;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider component that wraps the application and makes auth state available
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState<string | undefined>();
    const [tempToken, setTempToken] = useState<string | undefined>();

    // Fetch current user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                // Temporarily skip API call and use dummy data
                const dummyUser = {
                    id: "1",
                    name: "Angel Gaju Manzi",
                    email: "angel.gaju@ganzafrica.org",
                    role: "Admin",
                    permissions: ["admin", "user"]
                };
                
                setUser(dummyUser);
                
                // Comment out actual API call for now
                /*const response = await api.auth.me.query();
                if (response?.data?.user) {
                    setUser(response.data.user);
                }*/
            } catch (error) {
                console.error('Failed to fetch user:', error);
                // Keep the dummy user data even on error for now
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Login function - accepts simple parameters, does schema validation internally
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Schema validation
            const validatedData = loginSchema.parse({ email, password });

            // API call
            const response = await api.auth.login.mutate(validatedData);

            if (response.data?.requiresTwoFactor) {
                setRequiresTwoFactor(true);
                setTwoFactorMethod(response.data.twoFactorMethod);
                setTempToken(response.data.tempToken);
                return true;
            } else if (response.data?.user) {
                setUser(response.data.user);
                setRequiresTwoFactor(false);
                setTwoFactorMethod(undefined);
                setTempToken(undefined);
                toast.success('Login successful');
                router.push('/dashboard');
                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Verify two-factor authentication
    const verifyTwoFactor = useCallback(async (code: string): Promise<boolean> => {
        try {
            if (!tempToken) {
                toast.error('No verification session found');
                return false;
            }

            setIsLoading(true);

            // API call
            const response = await api.auth.verifyTwoFactor.mutate({
                token: tempToken,
                code
            });

            if (response.data?.user) {
                setUser(response.data.user);
                setRequiresTwoFactor(false);
                setTwoFactorMethod(undefined);
                setTempToken(undefined);
                toast.success('Login successful');
                router.push('/dashboard');
                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [tempToken, router]);

    // Signup function
    const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Schema validation
            const validatedData = signupSchema.parse({ name, email, password });

            // API call
            const response = await api.auth.signup.mutate(validatedData);

            if (response.success) {
                toast.success('Account created successfully. Please check your email to verify your account.');
                router.push('/login');
                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Request password reset
    const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Schema validation
            const validatedData = requestPasswordResetSchema.parse({ email });

            // API call
            const response = await api.auth.requestPasswordReset.mutate(validatedData);

            if (response.success) {
                toast.success('If your email is registered, you will receive reset instructions shortly.');
                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reset password
    const resetPassword = useCallback(async (token: string, password: string, confirmPassword: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Schema validation
            const validatedData = resetPasswordSchema.parse({ token, password, confirmPassword });

            // API call
            const response = await api.auth.resetPassword.mutate(validatedData);

            if (response.success) {
                toast.success('Password has been reset successfully. You can now log in with your new password.');
                router.push('/login');
                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Verify email
    const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Schema validation
            const validatedData = verifyEmailSchema.parse({ token });

            // API call
            const response = await api.auth.verifyEmail.mutate(validatedData);

            if (response.success) {
                toast.success('Email verified successfully. You can now log in to your account.');
                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Setup two-factor authentication
    const setupTwoFactor = useCallback(async (): Promise<{ qrCodeUrl: string; secret: string } | null> => {
        try {
            setIsLoading(true);

            // API call
            const response = await api.auth.setupTwoFactor.mutate();

            if (response.success && response.data) {
                toast.success('Two-factor authentication setup initiated');
                return {
                    qrCodeUrl: response.data.qrCodeUrl,
                    secret: response.data.secret
                };
            }

            return null;
        } catch (error) {
            handleApiError(error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Verify and enable two-factor authentication
    const verifyTwoFactorSetup = useCallback(async (code: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Schema validation
            const validatedData = setupTotpSchema.parse({ totpCode: code });

            // API call
            const response = await api.auth.verifyTwoFactorSetup.mutate(validatedData);

            if (response.success) {
                toast.success('Two-factor authentication enabled successfully');

                // Refresh user to update 2FA status
                const userResponse = await api.auth.me.query();
                if (userResponse.data?.user) {
                    setUser(userResponse.data.user);
                }

                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Disable two-factor authentication
    const disableTwoFactor = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);

            // API call
            const response = await api.auth.disableTwoFactor.mutate();

            if (response.success) {
                toast.success('Two-factor authentication disabled successfully');

                // Refresh user to update 2FA status
                const userResponse = await api.auth.me.query();
                if (userResponse.data?.user) {
                    setUser(userResponse.data.user);
                }

                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);

            // API call
            const response = await api.auth.logout.mutate();

            if (response.success) {
                setUser(null);
                toast.success('Logged out successfully');
                router.push('/login');
                return true;
            }

            return false;
        } catch (error) {
            handleApiError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Create context value object
    const contextValue: AuthContextType = {
        // State
        user,
        isLoading,
        isAuthenticated: !!user,
        requiresTwoFactor,
        twoFactorMethod,
        tempToken,

        // Methods
        login,
        logout,
        signup,
        verifyTwoFactor,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        setupTwoFactor,
        verifyTwoFactorSetup,
        disableTwoFactor,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the auth context
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}