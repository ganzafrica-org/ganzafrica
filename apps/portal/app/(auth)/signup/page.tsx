"use client";

import { SignupForm } from "@/components/auth";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignupPageContent() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("user"); // 'alumni' or null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <SignupForm userType={userType} />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
