"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { hasRequiredRole } from "@/utils/middleware/auth-guards";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** RBAC role names, e.g. ["hr", "admin"] — see auth-guards.ts. */
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, roles: userRoles, isAuthenticated } = useAuth();

  const denied = !!roles && !!user && !hasRequiredRole(userRoles, roles);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/hr/login");
      return;
    }
    if (denied) router.replace("/");
  }, [isAuthenticated, denied, router]);

  if (!isAuthenticated) return null;
  if (denied) return null;

  return <>{children}</>;
}
