"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { shouldBlockUser, fetchUserProfile } from '@/lib/auth-utils';
import { logger } from '@/lib/logger';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    initials: string;
    color: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session and fetch fresh user profile
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                try {
                    // Fetch fresh user profile from API
                    const userProfile = await fetchUserProfile();
                    
                    if (userProfile) {
                        // Check if user should be blocked from accessing the platform
                        if (shouldBlockUser(userProfile)) {
                        // Clear session and redirect to portal login
                        localStorage.removeItem('task_token');
                        localStorage.removeItem('task_user');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
                        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
                        window.location.href = `${portalUrl}/login`;
                        return;
                        }
                        
                        // Get the complete user data from localStorage (updated by fetchUserProfile)
                        const userData = localStorage.getItem('task_user');
                        if (userData) {
                            const parsedUser = JSON.parse(userData);
                            setUser(parsedUser);
                        }
                    } else {
                        // No valid profile found, clear session
                        localStorage.removeItem('task_token');
                        localStorage.removeItem('task_user');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
                    }
                } catch (error: unknown) {
                    logger.error('Error initializing auth:', error);
                    localStorage.removeItem('task_token');
                    localStorage.removeItem('task_user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                }
            }
            
            setIsLoading(false);
        };
        
        initializeAuth();
    }, []);

    const logout = () => {
        localStorage.removeItem('task_token');
        localStorage.removeItem('task_user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        logger.info('Logged out successfully');
        // Redirect to portal login
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
        window.location.href = `${portalUrl}/login`;
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
