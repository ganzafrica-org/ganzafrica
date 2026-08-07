"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Progress } from "@workspace/ui/components/progress";
import { useAuth } from "@/components/auth/auth-provider";

export default function EntryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("Initializing application");

  // Read from refs inside the interval so the effect below doesn't need
  // these values in its dependency array (which would recreate the
  // interval on every tick / every auth-state change).
  const progressRef = useRef(0);
  const authRef = useRef({ isAuthenticated, isLoading });
  authRef.current = { isAuthenticated, isLoading };

  useEffect(() => {
    // Detailed loading steps
    const loadingSteps = [
      { progress: 20, message: "Getting things ready" },
      { progress: 50, message: "Just making sure everything checks out" },
      { progress: 70, message: "Almost there..." },
      { progress: 100, message: "You’re in — let’s begin" },
    ];

    // Progress simulation
    const timer = setInterval(() => {
      const currentStep = loadingSteps.find(
        (step) => step.progress > progressRef.current && step.progress <= 100,
      );

      if (currentStep) {
        progressRef.current = currentStep.progress;
        setProgress(currentStep.progress);
        setLoadingStep(currentStep.message);
      }

      // If we've reached the final step and authentication check is complete
      const { isAuthenticated, isLoading } = authRef.current;
      if (progressRef.current === 100 && !isLoading) {
        clearInterval(timer);
        if (isAuthenticated) {
          router.push("/platform-selection");
        } else {
          router.push("/login");
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center w-full max-w-md px-4">
        <Image
          src={
            process.env.NODE_ENV === "production" ? "/portal/images/logo.png" : "/images/logo.png"
          }
          alt="Ganz Africa Logo"
          width={200}
          height={200}
          className="mx-auto mb-6"
          priority
        />
        <h1 className="text-2xl font-bold text-primary-green">Empowering Youth Changemakers</h1>
        <p className="text-primary-orange mt-2">Transforming Land, Environment, and Agriculture</p>

        <div className="mt-6 w-full">
          <Progress value={progress} className="w-full" />
        </div>

        <div className="mt-4 text-secondary-green">{loadingStep}...</div>
      </div>
    </div>
  );
}
