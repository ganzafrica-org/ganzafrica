"use client";

import React, { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackUrl?: string;
}

export function ProtectedRoute({
  children,
  fallbackUrl,
}: ProtectedRouteProps): React.JSX.Element | null {
  const defaultPortalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
  const finalFallbackUrl = fallbackUrl || `${defaultPortalUrl}/login`;
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = finalFallbackUrl;
    }
  }, [isAuthenticated, isLoading, finalFallbackUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
