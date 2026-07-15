"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";
import httpClient from "@/services/http.service";
import type { User } from "@/types/api";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

type AuthContextType = {
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchMe(): Promise<User & { roles?: string[] }> {
  const res = await httpClient.get<{ user: User & { roles?: string[] } }>("/auth/me");
  return res.data.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchMe,
    retry: (count, error: any) => (error?.response?.status === 401 ? false : count < 2),
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: () => httpClient.post("/auth/logout"),
    onSettled: () => {
      queryClient.clear();
      window.location.href = `${PORTAL_URL}/login`;
    },
  });

  const value: AuthContextType = {
    user: user ?? null,
    roles: user?.roles ?? [],
    isAuthenticated: !!user,
    isLoading,
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
