"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchUserProfile } from "@/lib/auth-utils";

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

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          // Fetch fresh user profile from API
          const userProfile = await fetchUserProfile();

          if (userProfile) {
            // Get the complete user data from localStorage (updated by fetchUserProfile)
            const userData =
              localStorage.getItem("alumni_user") ||
              localStorage.getItem("user");
            if (userData) {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
            }
          } else {
            // No valid profile found, clear session
            localStorage.removeItem("alumni_user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
          }
        } catch (error: unknown) {
          console.error("Error initializing auth:", error);
          localStorage.removeItem("alumni_user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("alumni_user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    // Redirect to portal login with alumni param
    const portalUrl =
      process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
    window.location.href = `${portalUrl}/login?user=alumni`;
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
