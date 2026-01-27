import { GoogleAnalytics } from '@next/third-parties/google'
import { Rubik } from "next/font/google";
import ClientLayout from "@/components/layout/client-layout";
import { GoogleAnalyticsComponent } from "@/components/analytics/google-analytics";
import React, { Suspense } from "react";
import "@workspace/ui/globals.css";
import {Metadata} from "next";

// Font optimization - Using Rubik
const fontRubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

// Metadata generation
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web.ganzafrica.org';

export const metadata: Metadata = {
    // Title optimized for SEO (60 chars max)
    title: {
        default: 'GanzAfrica | Empowering Africa\'s Food System Leaders',
        template: '%s | GanzAfrica',
    },

    // Meta description (155 chars max, action-oriented)
    description: "GanzAfrica empowers African youth through agriculture training, sustainable land management, and data-driven leadership programs.",

    // Base URL for all relative paths
    metadataBase: new URL(baseUrl),

    // Core SEO fields
    keywords: [
        'GanzAfrica', 'African agriculture', 'youth training',
        'sustainable farming', 'food systems', 'mentorship'
    ],
    authors: [{name: 'GanzAfrica Team'}],
    creator: '@GanzAfrica',

    // Critical link tags
    alternates: {
        canonical: '/',
    },

    // Open Graph (Social Media Cards)
    openGraph: {
        type: 'website',
        siteName: 'GanzAfrica',
        title: {
            default: 'GanzAfrica | Empowering Africa\'s Food System Leaders',
            template: '%s | GanzAfrica',
        },
        description: "Transforming Africa's food systems through youth empowerment, sustainable agriculture, and data-driven innovation.",
        url: baseUrl,
        images: [{
            url: `${baseUrl}/images/alumni_program.jpg`,
            width: 1200,
            height: 630,
            alt: 'GanzAfrica - Empowering Africa',
        }],
    },

    // Twitter Cards
    twitter: {
        card: 'summary_large_image',
        title: {
            default: 'GanzAfrica | Empowering Africa\'s Food System Leaders',
            template: '%s | GanzAfrica',
        },
        description: "Transforming Africa's food systems through youth empowerment, sustainable agriculture, and data-driven innovation.",
        creator: '@GanzAfrica',
        images: [`${baseUrl}/images/alumni_program.jpg`],
    },
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
        <GoogleAnalytics gaId= "G-F2YBDRRV32" />
      </body>
    </html>
  );
}