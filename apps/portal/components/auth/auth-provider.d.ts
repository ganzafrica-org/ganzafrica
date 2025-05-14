import React from 'react';
export interface User {
    id: string;
    name: string;
    email: string;
    role_id: number;
    role_name?: string;
    avatar_url: string | null;
    email_verified: boolean;
    is_active?: boolean;
}
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
//# sourceMappingURL=auth-provider.d.ts.map