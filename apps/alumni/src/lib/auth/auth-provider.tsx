"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import apiClient from "@/lib/api-client";
import { fetchUserProfile } from "@/lib/auth-utils";

interface User {
  id: string;
  email: string;
  name: string;
  role_name?: string;
  role_id?: number;
  avatar_url?: string | null;
  roles?: string[];
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
        await fetchUserProfile();
        if (me) {
          setUser({ ...me, role_name: me.roles?.[0] ?? me.role_name });
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

  // Check if user is authenticated AND has alumni or admin role
  const isAuthenticated: boolean =
    !!user &&
    !!(
      user.role_name?.toLowerCase().includes("alumni") ||
      user.role_name?.toLowerCase().includes("admin") ||
      user.role_name?.toLowerCase().includes("manager") ||
      user.role_name?.toLowerCase().includes("staff") ||
      user.roles?.some(
        (role) =>
          role.toLowerCase().includes("alumni") ||
          role.toLowerCase().includes("admin") ||
          role.toLowerCase().includes("manager") ||
          role.toLowerCase().includes("staff"),
      )
    );

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
