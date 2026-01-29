import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GanzAfrica HR & Alumni Platform",
  description:
    "Comprehensive HR management and alumni community platform for GanzAfrica",
  keywords: [
    "HR",
    "Alumni",
    "GanzAfrica",
    "Agriculture",
    "Environment",
    "Rwanda",
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
    url: "https://hr.ganzafrica.org",
    title: "GanzAfrica HR & Alumni Platform",
    description: "Empowering youth in agriculture and environment sectors",
    siteName: "GanzAfrica Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "GanzAfrica HR & Alumni Platform",
    description: "Empowering youth in agriculture and environment sectors",
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
        <TooltipProvider>
          <Toaster position="top-right" />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
