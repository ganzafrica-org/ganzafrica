"use client";

import React, { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import apiClient from "../../lib/api-client";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

// Access to the internal payroll app is still gated by the email allowlist until FND-07/MOD-07
// replaces it with the finance/hr RBAC role.
function isAuthorized(email?: string): boolean {
  const allow =
    process.env.NEXT_PUBLIC_INTERNAL_AUTHORIZED_EMAILS?.split(",").map((e) => e.trim()) || [];
  return !!email && allow.includes(email);
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const run = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/payroll/payslips";

      const gate = (email?: string) => {
        if (!isAuthorized(email)) {
          toast.error("You are not authorized to access the Internal Platform");
          setTimeout(() => (window.location.href = `${PORTAL_URL}/platform-selection`), 2000);
          return;
        }
        router.replace(next);
      };

      try {
        const me = await apiClient.get("/auth/me");
        gate(me.data?.user?.email);
        return;
      } catch {
        // no session yet
      }

      if (code) {
        try {
          const res = await apiClient.post("/auth/handoff/exchange", { code });
          gate(res.data?.user?.email);
          return;
        } catch {
          // fall through
        }
      }

      const login = new URL(`${PORTAL_URL}/login`);
      login.searchParams.set("next", window.location.href);
      window.location.href = login.toString();
    };

    run().finally(() => setIsProcessing(false));
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#045F3C] mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#045F3C] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
