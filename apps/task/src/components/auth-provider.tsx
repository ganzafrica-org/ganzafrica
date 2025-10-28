"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { shouldBlockUser, fetchUserProfile } from '@/lib/auth-utils';

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
    login: (credentials: { email: string; password: string }) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => false,
    logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session and fetch fresh user profile
        const initializeAuth = async () => {
            const token = localStorage.getItem('task_token') || localStorage.getItem('accessToken');
            
            if (token) {
                try {
                    // Fetch fresh user profile from API
                    const userProfile = await fetchUserProfile();
                    
                    if (userProfile) {
                        // Check if user should be blocked from accessing the platform
                        if (shouldBlockUser(userProfile)) {
                            // Clear session and redirect to login
                            localStorage.removeItem('task_token');
                            localStorage.removeItem('task_user');
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('user');
                            router.push('/login');
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
                } catch (error) {
                    console.error('Error initializing auth:', error);
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

    const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
        try {
            // Demo authentication - replace with real API call
            const demoAccounts = [
                { email: 'admin@ganzafrica.org', password: 'password', role: 'admin' },
                { email: 'hr@ganzafrica.org', password: 'password', role: 'team' },
                { email: 'employee@ganzafrica.org', password: 'password', role: 'public' },
                { email: 'fellow@ganzafrica.org', password: 'password', role: 'public' },
                { email: 'alumni@ganzafrica.org', password: 'password', role: 'public' },
            ];
            
            const account = demoAccounts.find(acc => 
                acc.email === credentials.email && acc.password === credentials.password
            );
            
            if (account) {
                // Check if user is Alumni - block access to platform
                if (account.role === 'alumni' || account.email.toLowerCase().includes('alumni')) {
                    console.error('Access Denied: Alumni users are not allowed to access the task management platform.');
                    return false;
                }
                
                const userData: User = {
                    id: Math.random().toString(36).substr(2, 9),
                    email: account.email,
                    name: account.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    role: account.role,
                    initials: account.email.split('@')[0].substr(0, 2).toUpperCase(),
                    color: '#076297'
                };
                
                localStorage.setItem('task_user', JSON.stringify(userData));
                localStorage.setItem('task_token', 'demo_token_' + Date.now());
                
                setUser(userData);
                console.log('Login successful');
                return true;
            } else {
                console.error('Invalid email or password');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            console.error('Login failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('task_token');
        localStorage.removeItem('task_user');
        setUser(null);
        console.log('Logged out successfully');
        router.push('/login');
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
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
