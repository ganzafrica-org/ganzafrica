"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { jwtDecode } from "jwt-decode";

// User interface based on your backend schema
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

// JWT token payload interface - including all possible field names
interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role_id: number;
  role_name?: string;
  email_verified: boolean;
  avatar_url?: string | null;
  is_active?: boolean;
  exp: number;

  userId?: string;
  user_id?: string;
  username?: string;
  fullName?: string;
  full_name?: string;
  roleId?: number;
  roleName?: string;
  role?: string;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  isActive?: boolean;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

// Protected routes that require authentication
const protectedRoutes = ["/profile", "/dashboard", "/settings", "/users"];

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Function to parse user from token
  const getUserFromToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        return null;
      }

      return {
        id: decoded.id || decoded.userId || decoded.user_id || "",
        name: decoded.name || decoded.fullName || decoded.full_name || "",
        email: decoded.email || decoded.username || "",
        role_id: decoded.role_id || decoded.roleId || 0,
        role_name: decoded.role_name || decoded.roleName || decoded.role,
        avatar_url: decoded.avatar_url || decoded.avatarUrl || null,
        email_verified: decoded.email_verified || decoded.emailVerified || false,
        is_active: decoded.is_active || decoded.isActive,
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  // Load the current user from the session cookie via /auth/me.
  const loadUser = async (): Promise<boolean> => {
    try {
      const res = await apiClient.get("/auth/me");
      const me = res.data.user;
      if (me) {
        setUser({ ...me, role_name: me.roles?.[0] ?? me.role_name });
        return true;
      }
      setUser(null);
      return false;
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Public function to refresh user data
  const refreshUser = async () => {
    setIsLoading(true);
    await loadUser();
  };

  // Run auth check only on initial mount and when navigating to protected routes
  useEffect(() => {
    // Check if we're on a protected route before running auth check
    const isProtectedRoute = protectedRoutes.some((route) => pathname?.startsWith(route));

    // Only run auth check on initial load or when navigating to protected routes
    if (!authChecked || isProtectedRoute) {
      const checkAuth = async () => {
        const hasUser = await loadUser();
        setAuthChecked(true);
        if (!hasUser && isProtectedRoute) {
          toast.error("Please log in to access this page");
          router.replace("/login");
        }
      };

      checkAuth();
    }
  }, [pathname, authChecked]); // Only re-run when pathname changes or when auth hasn't been checked yet

  // Logout functionality
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error: any) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || !authChecked,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
