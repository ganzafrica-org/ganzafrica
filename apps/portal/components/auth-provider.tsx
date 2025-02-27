"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/api-service";

// Define the auth context type
type AuthContextType = {
    user: any;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => void;
    logout: () => void;
    signup: (userData: { email: string; password: string; name: string }) => void;
    requestPasswordReset: (data: { email: string }) => void;
    resetPassword: (data: { token: string; password: string; confirmPassword: string }) => void;
    verifyEmail: (data: { token: string }) => void;
    verifyTwoFactor: (data: { token: string; code: string }) => void;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const publicRoutes = [
    "/login",
    "/signup",
    "/reset-password",
    "/forgot-password",
    "/verify-email",
    "/two-factor",
];

// Authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const {
        user,
        isLoggedIn,
        isLoading,
        login,
        logout,
        signup,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        verifyTwoFactor,
    } = useAuth();

    const router = useRouter();
    const pathname = usePathname();

    // Handle route protection
    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = publicRoutes.some((route) =>
                pathname === route || pathname?.startsWith(`${route}/`)
            );

            if (!isLoggedIn && !isPublicRoute) {
                // Redirect to login if trying to access a protected route without being logged in
                router.push("/login");
            } else if (isLoggedIn && isPublicRoute && pathname !== "/two-factor") {
                // Redirect to dashboard if trying to access a public route while logged in
                router.push("/dashboard");
            }
        }
    }, [isLoggedIn, isLoading, pathname, router]);

    // Auth context value
    const contextValue: AuthContextType = {
        user,
        isLoggedIn,
        isLoading,
        login,
        logout,
        signup,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        verifyTwoFactor,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use the auth context
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}