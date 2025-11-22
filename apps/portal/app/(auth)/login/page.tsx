"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("user"); // 'alumni' or null

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <LoginForm userType={userType} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
