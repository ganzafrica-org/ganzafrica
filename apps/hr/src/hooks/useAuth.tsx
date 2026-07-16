"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import type { LoginRequest, User } from "@/types/api";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

// ── Token decoder ─────────────────────────────────────────────────────────────

function decodeTokenUser(token: string): Partial<User> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
    return {
      id: payload.sub ?? payload.id ?? "",
      name: payload.name ?? payload.email?.split("@")[0] ?? "User",
      email: payload.email ?? "",
      role: payload.role ?? "EMPLOYEE",
      avatarUrl: payload.avatarUrl,
    };
  } catch {
    return {};
  }
}

// ── Auth Context ──────────────────────────────────────────────────────────────

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Internal hooks (used inside the provider) ─────────────────────────────────

function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem(TOKEN_KEY),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (response) => {
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);

      const decoded = decodeTokenUser(accessToken);
      const mergedUser: User = { ...user, role: decoded.role ?? user.role };

      // Seed cache immediately — no loading flash after login
      queryClient.setQueryData(["currentUser"], mergedUser);

      await fetch("/api/set-session", {
        method: "POST",
        body: JSON.stringify({ accessToken }),
      });

      router.push("/");
    },
  });
}

function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: async () => {
      // onSettled ensures cleanup runs even if the API call fails
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);

      queryClient.removeQueries({ queryKey: ["currentUser"] });
      queryClient.clear();

      await fetch("/api/set-session", { method: "DELETE" });

      router.push("/auth/login");
    },
  });
}

// ── AuthProvider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading: userLoading } = useCurrentUserQuery();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: userLoading || loginMutation.isPending || logoutMutation.isPending,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── useAuth ───────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
