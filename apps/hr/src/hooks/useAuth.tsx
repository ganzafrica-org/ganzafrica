"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import type { User, LoginRequest } from "@/types/api";

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const bootstrap = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // Try to decode token first to get immediate role/user info
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const decoded = JSON.parse(jsonPayload);
                // Map common JWT claims to our User object
                const decodedUser: User = {
                    id: decoded.sub || decoded.id || "",
                    name: decoded.name || decoded.email?.split('@')[0] || "User",
                    email: decoded.email || "",
                    role: decoded.role || "EMPLOYEE",
                    avatarUrl: decoded.avatarUrl
                };
                setUser(decodedUser);
            } catch (decodeError) {
                console.error("Failed to decode token", decodeError);
            }

            // Still fetch fresh user data from API
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Auth bootstrap failed", error);
            // If it's a 401, we might want to clear tokens, but httpClient might already do it
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        bootstrap();
    }, []);

    const login = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            
            // Store tokens in localStorage as requested
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);

            // Try to decode token to ensure we have the most up-to-date role/user info
            try {
                const base64Url = response.accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                
                // Merge decoded info with response.user
                const mergedUser: User = {
                    ...response.user,
                    role: decoded.role || response.user.role || "EMPLOYEE"
                };
                setUser(mergedUser);
            } catch (e) {
                setUser(response.user);
            }
            
            // Set session cookie for middleware
            await fetch("/api/set-session", {
                method: "POST",
                body: JSON.stringify({ accessToken: response.accessToken }),
            });

            router.push("/");
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            setUser(null);
            
            // Clear session cookie
            await fetch("/api/set-session", {
                method: "DELETE",
            });

            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
