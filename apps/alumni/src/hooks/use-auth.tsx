"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState, LoginCredentials } from "@/lib/types/auth";

// Dummy users data
const DUMMY_USERS: User[] = [
  {
    id: "1",
    email: "admin@ganzafrica.org",
    name: "Sarah Uwimana",
    role: "admin",
    department: "Administration",
    position: "System Administrator",
    created_at: "2024-01-01T00:00:00Z",
    last_login: "2024-12-10T08:00:00Z",
    is_active: true,
    avatar_url: undefined,
  },
  {
    id: "2",
    email: "hr@ganzafrica.org",
    name: "Jean Baptiste Mukamana",
    role: "hr_staff",
    department: "Human Resources",
    position: "HR Manager",
    created_at: "2024-01-15T00:00:00Z",
    last_login: "2024-12-10T09:30:00Z",
    is_active: true,
    avatar_url: undefined,
  },
  {
    id: "3",
    email: "employee@ganzafrica.org",
    name: "Marie Claire Nsengimana",
    role: "employee",
    department: "Agriculture",
    position: "Agricultural Specialist",
    created_at: "2024-02-01T00:00:00Z",
    last_login: "2024-12-10T07:45:00Z",
    is_active: true,
    avatar_url: undefined,
  },
  {
    id: "4",
    email: "fellow@ganzafrica.org",
    name: "David Niyonkuru",
    role: "fellow",
    department: "Fellowship Program",
    position: "Youth Fellow",
    created_at: "2024-03-01T00:00:00Z",
    last_login: "2024-12-10T10:00:00Z",
    is_active: true,
    avatar_url: undefined,
  },
  {
    id: "5",
    email: "alumni@ganzafrica.org",
    name: "Grace Uwimana",
    role: "alumni",
    department: "Environment",
    position: "Environmental Consultant",
    created_at: "2023-01-01T00:00:00Z",
    last_login: "2024-12-09T16:00:00Z",
    is_active: true,
    avatar_url: undefined,
  },
];

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("ganz_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem("ganz_user");
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = DUMMY_USERS.find((u) => u.email === credentials.email);

    if (user) {
      // In real app, verify password here
      const updatedUser = { ...user, last_login: new Date().toISOString() };
      localStorage.setItem("ganz_user", JSON.stringify(updatedUser));

      setAuthState({
        user: updatedUser,
        isLoading: false,
        isAuthenticated: true,
      });
      return true;
    }

    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    return false;
  };

  const signOut = () => {
    localStorage.removeItem("ganz_user");
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
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
