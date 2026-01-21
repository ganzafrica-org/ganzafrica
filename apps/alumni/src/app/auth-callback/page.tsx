"use client";

import React, { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

function LoadingScreen({
  message = "Initializing application",
}: {
  message?: string;
}) {
  const logoSrc =
    process.env.NODE_ENV === "production"
      ? "/alumni/images/logo.png"
      : "/images/logo.png";

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
    process.env.NODE_ENV === "production"
      ? "/alumni/images/logo.png"
      : "/images/logo.png";

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

    const processAuth = () => {
      try {
        const token = searchParams.get("token");
        const user = searchParams.get("user");
        const portalUrl =
          process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

        if (token && user) {
          try {
            // Clear ALL old tokens and user data first
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("alumni_user");

            // Store the NEW authentication tokens
            localStorage.setItem("accessToken", token);

            // Store user data - safely parse the user data
            let parsedUser;
            try {
              const decodedUser = decodeURIComponent(user);
              parsedUser = JSON.parse(decodedUser);
            } catch (parseError) {
              console.error("Error parsing user data:", parseError);
              toast.error("Invalid user data received");
              clearInterval(timer);
              window.location.href = `${portalUrl}/login?user=alumni`;
              return;
            }

            localStorage.setItem("user", JSON.stringify(parsedUser));
            localStorage.setItem("alumni_user", JSON.stringify(parsedUser));

            toast.success("Authentication successful!");

            // Wait for progress animation then redirect to dashboard
            // Use window.location to ensure a full page reload with fresh auth state
            setTimeout(() => {
              clearInterval(timer);
              // In production, basePath is /alumni, so we need to redirect relative to current location
              // Using relative path ensures it works in both dev (no basePath) and prod (with /alumni basePath)
              const basePath =
                process.env.NODE_ENV === "production" ? "/alumni" : "";
              window.location.href = `${basePath}/`;
            }, 2000);
          } catch (error: unknown) {
            console.error("Error processing authentication:", error);
            toast.error("Authentication failed. Please try again.");
            clearInterval(timer);
            window.location.href = `${portalUrl}/login?user=alumni`;
          }
        } else {
          // No authentication data, redirect to portal login
          toast.error("No authentication data received");
          clearInterval(timer);
          window.location.href = `${portalUrl}/login?user=alumni`;
        }
      } catch (error: unknown) {
        console.error("Error in auth callback:", error);
        clearInterval(timer);
        const portalUrl =
          process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
        window.location.href = `${portalUrl}/login?user=alumni`;
      }
    };

    // Start processing after a small delay
    setTimeout(processAuth, 500);

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
