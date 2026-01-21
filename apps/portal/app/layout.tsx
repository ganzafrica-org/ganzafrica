"use client";

import { Toaster } from "@workspace/ui/components/sonner";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/components/auth/auth-provider";

// Use system fonts as fallback to avoid build-time network dependency
// Rubik font can be loaded via CSS if needed, but won't block builds
const fontVariable = '--font-rubik';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-rubik font-sans antialiased bg-gray-50`} style={{ fontFamily: 'Rubik, system-ui, -apple-system, sans-serif' }}>
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
