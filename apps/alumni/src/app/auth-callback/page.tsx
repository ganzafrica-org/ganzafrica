"use client";

import React, { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { completeAuthCallback } from "@/lib/auth-callback";

function LoadingScreen({ message = "Initializing application" }: { message?: string }) {
  const logoSrc =
    process.env.NODE_ENV === "production" ? "/alumni/images/logo.png" : "/images/logo.png";

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center w-full max-w-md px-4">
        <Image
          src={logoSrc}
          alt="GanzAfrica Logo"
          width={200}
          height={200}
          className="mx-auto mb-6"
          priority
        />
        <h1 className="text-2xl font-bold text-[#045F3C]">Alumni Network</h1>
        <p className="text-[#f8ba1d] mt-2">Connecting GanzAfrica Alumni</p>

        <div className="mt-6 w-full">
          <Progress value={50} className="w-full" />
        </div>

        <div className="mt-4 text-[#045F3C]/70">{message}...</div>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("Initializing application");
  const logoSrc =
    process.env.NODE_ENV === "production" ? "/alumni/images/logo.png" : "/images/logo.png";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadingSteps = [
      { progress: 20, message: "Getting things ready" },
      { progress: 50, message: "Verifying your credentials" },
      { progress: 70, message: "Almost there..." },
      { progress: 100, message: "Welcome back!" },
    ];

    let stepIndex = 0;
    const timer = setInterval(() => {
      if (stepIndex < loadingSteps.length) {
        setProgress(loadingSteps[stepIndex].progress);
        setLoadingStep(loadingSteps[stepIndex].message);
        stepIndex++;
      }
    }, 400);

    const basePath = process.env.NODE_ENV === "production" ? "/alumni" : "";
    completeAuthCallback({
      code: searchParams.get("code"),
      next: searchParams.get("next") || `${basePath}/`,
      onSuccess: (dest) => {
        clearInterval(timer);
        window.location.href = dest;
      },
    });

    return () => clearInterval(timer);
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center w-full max-w-md px-4">
        <Image
          src={logoSrc}
          alt="GanzAfrica Logo"
          width={200}
          height={200}
          className="mx-auto mb-6"
          priority
        />
        <h1 className="text-2xl font-bold text-[#045F3C]">Alumni Network</h1>
        <p className="text-[#f8ba1d] mt-2">Connecting GanzAfrica Alumni</p>

        <div className="mt-6 w-full">
          <Progress value={progress} className="w-full" />
        </div>

        <div className="mt-4 text-[#045F3C]/70">{loadingStep}...</div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingScreen message="Loading" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
