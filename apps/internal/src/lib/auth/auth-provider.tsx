"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import apiClient from "@/lib/api-client";
import { fetchUserProfile, isEmailAuthorized } from "@/lib/auth-utils";

interface User {
  id: string;
  email: string;
  name: string;
  role_name?: string;
  role_id?: number;
  avatar_url?: string | null;
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

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        const me = res.data.user;
        await fetchUserProfile();
        if (me) {
          const profile = { ...me, role_name: me.roles?.[0] ?? me.role_name } as User;
          if (!isEmailAuthorized(profile)) {
            window.location.href = `${PORTAL_URL}/platform-selection`;
            return;
          }
          setUser(profile);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
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

  // User is authenticated if they exist AND are authorized by email
  const isAuthenticated: boolean = !!user && isEmailAuthorized(user);

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
