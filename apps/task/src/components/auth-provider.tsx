"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import apiClient from "@/lib/api-client";
import { fetchUserProfile, shouldBlockUser } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

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

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        const me = res.data.user;
        await fetchUserProfile(); // populate the sync role cache
        if (me) {
          const profile = { ...me, role: me.roles?.[0] ?? me.role_name };
          if (shouldBlockUser(profile)) {
            window.location.href = `${PORTAL_URL}/login`;
            return;
          }
          setUser(profile as unknown as User);
        }
      } catch (error) {
        logger.error("Error initializing auth:", error);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {}
    setUser(null);
    window.location.href = `${PORTAL_URL}/login`;
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
