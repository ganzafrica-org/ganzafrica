'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
};

type AuthContextType = {
    user: AuthUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{
        success: boolean;
        requiresTwoFactor?: boolean;
        twoFactorMethod?: string;
        tempToken?: string;
    }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
    logout: () => Promise<void>;
    verifyTwoFactor: (token: string, code: string) => Promise<{ success: boolean }>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => ({ success: false }),
    register: async () => ({ success: false }),
    logout: async () => {},
    verifyTwoFactor: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in
        const checkAuthStatus = async () => {
            setIsLoading(true);
            try {
                const { success, user } = await authApi.getCurrentUser();
                if (success && user) {
                    setUser(user);
                }
            } catch (error) {
                console.error('Failed to get current user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const result = await authApi.login(email, password);

            if (result.success && result.user) {
                setUser(result.user);
                toast.success('Logged in successfully');
            }

            return result;
        } catch (error) {
            return { success: false };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        return await authApi.register(name, email, password);
    };

    const logout = async () => {
        try {
            const result = await authApi.logout();

            if (result.success) {
                setUser(null);
                toast.success('Logged out successfully');
                router.push('/login');
            } else {
                toast.error(result.message || 'Failed to log out');
            }
        } catch (error) {
            toast.error('Failed to log out');
        }
    };

    const verifyTwoFactor = async (token: string, code: string) => {
        try {
            const result = await authApi.verifyTwoFactor(token, code);

            if (result.success && result.user) {
                setUser(result.user);
                toast.success('Logged in successfully');
                return { success: true };
            }

            return { success: false };
        } catch (error) {
            return { success: false };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                verifyTwoFactor,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};