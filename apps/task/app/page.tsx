"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

export default function HomePage(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    apiClient
      .get("/auth/me")
      .then(() => router.push("/my-tasks"))
      .catch(() => {
        window.location.href = `${PORTAL_URL}/login`;
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
