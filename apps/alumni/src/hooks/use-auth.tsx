"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState, LoginCredentials } from "@/lib/types/auth";

const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signOut: () => void;
}>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  signOut: () => {},
});

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const { default: apiClient } = await import("@/lib/api-client");
        const res = await apiClient.get("/auth/me");
        const me = res.data.user;
        setAuthState({
          user: me ? ({ ...me, role: me.roles?.[0] ?? me.role_name } as User) : null,
          isLoading: false,
          isAuthenticated: !!me,
        });
      } catch {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      }
    })();
  }, []);

  // Login happens at the portal; kept for API compatibility (redirects there).
  const login = async (_credentials: LoginCredentials): Promise<boolean> => {
    window.location.href = `${PORTAL_URL}/login`;
    return false;
  };

  const signOut = async () => {
    try {
      const { default: apiClient } = await import("@/lib/api-client");
      await apiClient.post("/auth/logout");
    } catch {}
    setAuthState({ user: null, isLoading: false, isAuthenticated: false });
    window.location.href = `${PORTAL_URL}/login`;
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isLoading: authState.isLoading,
        isAuthenticated: authState.isAuthenticated,
        login,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
