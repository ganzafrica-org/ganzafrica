'use client';

import React, { createContext, useContext, PropsWithChildren } from 'react';
import { useAuth, UseAuthReturn } from '@/hooks/use-auth';

// Create a context for auth state
const AuthContext = createContext<UseAuthReturn | null>(null);

/**
 * Provider component that wraps the application and makes auth state available
 */
export function AuthProvider({ children }: PropsWithChildren) {
    const auth = useAuth();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the auth context
 */
export function useAuthContext(): UseAuthReturn {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}