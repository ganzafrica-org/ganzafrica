import { Rubik } from "next/font/google";
import ClientLayout from "@/components/layout/client-layout";
import { GoogleAnalyticsComponent } from "@/components/analytics/google-analytics";
import React, { Suspense } from "react";
import "@workspace/ui/globals.css";

// Font optimization - Using Rubik
const fontRubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

// Metadata generation
export async function generateMetadata() {
  return {
    title: {
      default: "GanzAfrica",
      template: `%s | GanzAfrica`,
    },
    description: "GanzAfrica offers an innovative training, mentorship, and work placement program that meets both pressing needs at once—and prepares African youth to take the future in their hands.",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://ganzafrica.org",
    ),
    alternates: {
      canonical: "/",
    },
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;

  return (
    <html
      className={`${fontRubik.variable} light`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Suspense fallback={null}>
            <GoogleAnalyticsComponent gaId={process.env.NEXT_PUBLIC_GA_ID} />
          </Suspense>
        )}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}