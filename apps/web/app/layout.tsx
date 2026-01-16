import { Rubik } from "next/font/google";
import { getDictionary } from "@/lib/get-dictionary";
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
  // Hardcoded to English since i18n is removed
  const locale = "en";
  const dict = await getDictionary(locale);

  return {
    title: {
      default: dict.site.name,
      template: `%s | ${dict.site.name}`,
    },
    description: dict.site.description,
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
  
  // Hardcoded to English
  const locale = "en";
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${fontRubik.variable} light`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Suspense fallback={null}>
            <GoogleAnalyticsComponent gaId={process.env.NEXT_PUBLIC_GA_ID} />
          </Suspense>
        )}
        <ClientLayout locale={locale} dict={dict}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}