import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/providers/app-provider";
import { ConditionalAppShell } from "@/components/layout/conditional-app-shell";

import { PrimeReactProvider } from 'primereact/api';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bagoss = localFont({
  src: [
    {
      path: "../../public/fonts/Bagoss-Standard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-bagoss",
  fallback: ["sans-serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "PsalmHR Dashboard",
  description: "HR CMS dashboard with employee, time-off, recruitment and calendar modules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", inter.variable, bagoss.variable)}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <PrimeReactProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            enableColorScheme
            disableTransitionOnChange
        >
          <AppProvider>
            <TooltipProvider>
              <ConditionalAppShell>{children}</ConditionalAppShell>
            </TooltipProvider>
          </AppProvider>
        </ThemeProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
