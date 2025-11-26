import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GanzAfrica Alumni Portal",
  description: "Connect with the GanzAfrica alumni community",
  keywords: [
    "Alumni",
    "GanzAfrica",
    "Agriculture",
    "Environment",
    "Rwanda",
    "Network",
  ],
  authors: [{ name: "GanzAfrica" }],
  creator: "GanzAfrica",
  publisher: "GanzAfrica",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://web.ganzafrica.org/portal/alumni",
    title: "GanzAfrica Alumni Portal",
    description: "Connect with the GanzAfrica alumni community",
    siteName: "GanzAfrica Alumni",
    images: [
      {
        url: "/images/alumni_program.jpg",
        width: 1200,
        height: 630,
        alt: "GanzAfrica Alumni Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GanzAfrica Alumni Portal",
    description: "Connect with the GanzAfrica alumni community",
    images: ["/images/alumni_program.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
