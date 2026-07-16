"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import { toast } from "sonner";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Show error message when page loads
    toast.error(
      "You are not authenticated to access this platform. Only administrators and managers can access the portal.",
      {
        duration: 5000,
      },
    );
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-white p-4 overflow-hidden">
      <div className="w-full max-w-2xl text-center flex flex-col items-center justify-center h-full">
        {/* Illustration */}
        <div className="mb-4 flex justify-center flex-shrink-0">
          <div className="relative">
            <Image
              src="/illust.jpg"
              alt="403 Forbidden - Access Restricted"
              width={400}
              height={250}
              className="w-auto h-auto object-contain"
              style={{ maxWidth: "300px", maxHeight: "200px" }}
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-green mb-2">We are Sorry...</h1>

        {/* Body Text */}
        <div className="space-y-1 mb-4 text-gray-700">
          <p className="text-base sm:text-lg">
            The page you&apos;re trying to access has restricted access.
          </p>
          <p className="text-base sm:text-lg">Please refer to your system administrator</p>
        </div>

        {/* Go Back Button */}
        <Button
          onClick={() => router.push("/platform-selection")}
          className="px-8 py-2.5 text-white font-medium rounded-lg text-base"
          style={{
            background: "linear-gradient(to right, #005C30, #009758)",
            border: "none",
          }}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
