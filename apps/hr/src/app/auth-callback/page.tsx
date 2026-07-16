"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeAuthCallback } from "@/services/auth-callback";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    completeAuthCallback({
      code: searchParams.get("code"),
      next: searchParams.get("next") || "/dashboard",
      onSuccess: (dest) => router.replace(dest),
    });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
