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
  useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        // First, try to get user from localStorage (set by auth callback)
        const userData =
          localStorage.getItem("alumni_user") || localStorage.getItem("user");

        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsLoading(false);

            // Then fetch fresh profile in the background to update if needed
            // This runs after we've already set the user, avoiding the race condition
            fetchUserProfile()
              .then((userProfile) => {
                if (userProfile) {
                  const updatedUserData =
                    localStorage.getItem("alumni_user") ||
                    localStorage.getItem("user");
                  if (updatedUserData) {
                    const updatedUser = JSON.parse(updatedUserData);
                    setUser(updatedUser);
                  }
                } else {
                  // Only clear if profile fetch explicitly fails (not just network error)
                  console.warn("Failed to fetch user profile");
                }
              })
              .catch((error) => {
                // Don't clear session on network errors, just log
                console.error("Error fetching user profile:", error);
              });

            return; // Exit early, user is set
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }

        // If we couldn't get user from localStorage, try fetching from API
        try {
          const userProfile = await fetchUserProfile();

          if (userProfile) {
            const fetchedUserData =
              localStorage.getItem("alumni_user") ||
              localStorage.getItem("user");
            if (fetchedUserData) {
              const parsedUser = JSON.parse(fetchedUserData);
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
