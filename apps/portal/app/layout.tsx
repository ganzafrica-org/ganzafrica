"use client";

import { Toaster } from "@workspace/ui/components/sonner";
import { Rubik } from "next/font/google";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";

const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // In App Router, client components cannot use redirect() directly at the top level
  // Instead, use useEffect for client-side redirects
  useEffect(() => {
    // Only redirect if we're not already on the login page
    const isAuthenticated = false; // Replace with real auth check
    const currentPath = window.location.pathname;
    
    if (!isAuthenticated && currentPath !== "/login") {
      window.location.href = "/login";
    } else if (isAuthenticated && currentPath !== "/dashboard") {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <html lang="en">
      <body className={`${rubik.className} font-sans antialiased bg-gray-50`}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}