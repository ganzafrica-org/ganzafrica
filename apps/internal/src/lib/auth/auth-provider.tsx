"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
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

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        // First, try to get user from localStorage (set by auth callback)
        const userData = localStorage.getItem("internal_user") || localStorage.getItem("user");

        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);

            // Check if user is authorized by email
            if (!isEmailAuthorized(parsedUser)) {
              console.warn("User not authorized for internal app");
              localStorage.removeItem("internal_user");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");

              const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
              window.location.href = `${portalUrl}/platform-selection`;
              return;
            }

            setUser(parsedUser);
            setIsLoading(false);

            // Then fetch fresh profile in the background to update if needed
            fetchUserProfile()
              .then((userProfile) => {
                if (userProfile) {
                  // Check authorization again with fresh data
                  if (!isEmailAuthorized(userProfile)) {
                    console.warn("User authorization revoked");
                    localStorage.removeItem("internal_user");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");

                    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
                    window.location.href = `${portalUrl}/platform-selection`;
                    return;
                  }

                  const updatedUserData =
                    localStorage.getItem("internal_user") || localStorage.getItem("user");
                  if (updatedUserData) {
                    const updatedUser = JSON.parse(updatedUserData);
                    setUser(updatedUser);
                  }
                } else {
                  console.warn("Failed to fetch user profile");
                }
              })
              .catch((error) => {
                console.error("Error fetching user profile:", error);
              });

            return;
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }

        // If we couldn't get user from localStorage, try fetching from API
        try {
          const userProfile = await fetchUserProfile();

          if (userProfile) {
            // Check if user is authorized
            if (!isEmailAuthorized(userProfile)) {
              console.warn("User not authorized for internal app");
              localStorage.removeItem("internal_user");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");

              const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
              window.location.href = `${portalUrl}/platform-selection`;
              return;
            }

            const fetchedUserData =
              localStorage.getItem("internal_user") || localStorage.getItem("user");
            if (fetchedUserData) {
              const parsedUser = JSON.parse(fetchedUserData);
              setUser(parsedUser);
            }
          } else {
            localStorage.removeItem("internal_user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
          }
        } catch (error: unknown) {
          console.error("Error initializing auth:", error);
          localStorage.removeItem("internal_user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("internal_user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);

    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
    window.location.href = `${portalUrl}/login`;
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
