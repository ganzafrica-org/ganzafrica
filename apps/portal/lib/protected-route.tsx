"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-provider";
import { isAdminOrManager } from "@/lib/auth-utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  roles?: string[];
  requireAdminOrManager?: boolean;
}

export function ProtectedRoute({
  children,
  fallbackUrl = "/login",
  roles = [],
  requireAdminOrManager = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasShownError = useRef(false);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Not authenticated? Redirect to login
    if (!isAuthenticated) {
      // Store the current URL so we can redirect back after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", pathname);
      }

      router.push(`${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check if admin/manager is required
    if (requireAdminOrManager && user) {
      if (!isAdminOrManager(user)) {
        if (!hasShownError.current) {
          toast.error(
            "You are not authenticated to access this platform. Only administrators and managers can access the portal.",
          );
          hasShownError.current = true;
        }
        router.push("/unauthorized");
        return;
      }
    }

    // Check specific roles if specified
    if (roles.length > 0 && user) {
      const roleName = user.role_name?.toLowerCase() || "";
      const hasRequiredRole = roles.some((role) => roleName.includes(role.toLowerCase()));
      if (!hasRequiredRole) {
        if (!hasShownError.current) {
          toast.error(
            "You are not authenticated to access this platform. Only administrators and managers can access the portal.",
          );
          hasShownError.current = true;
        }
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    router,
    pathname,
    fallbackUrl,
    roles,
    requireAdminOrManager,
  ]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check admin/manager requirement
  if (requireAdminOrManager && user && !isAdminOrManager(user)) {
    return null;
  }

  // Check specific roles if specified
  if (roles.length > 0 && user) {
    const roleName = user.role_name?.toLowerCase() || "";
    const hasRequiredRole = roles.some((role) => roleName.includes(role.toLowerCase()));
    if (!hasRequiredRole) {
      return null;
    }
  }

  // User is authenticated (and has required role if specified)
  return <>{children}</>;
}

export default ProtectedRoute;
