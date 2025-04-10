"use client";

import { Toaster } from "@workspace/ui/components/sonner";
import { Rubik } from "next/font/google";
import { useEffect } from "react";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { AuthProvider } from '@/components/auth/auth-provider';

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: '--font-rubik',
});



export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Remove authentication check for now while using dummy data
  return (
    <html lang="en" className="light">
      <body className={`${rubik.variable} font-sans antialiased bg-gray-50`}>
        <AuthProvider>
          <Providers>
            {children}
          </Providers>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}