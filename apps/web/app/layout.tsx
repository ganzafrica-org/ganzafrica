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
export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  // Ensure locale is one of the supported ones, fallback to 'en'
  const locale =
    params.locale && ["en", "fr"].includes(params.locale)
      ? params.locale
      : "en";

  // Load dictionary based on locale
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
      languages: {
        en: "/en",
        fr: "/fr",
      },
    },
  };
}

export default async function RootLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  // Ensure locale is one of the supported ones, fallback to 'en'
  const locale =
    params.locale && ["en", "fr"].includes(params.locale)
      ? params.locale
      : "en";
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
