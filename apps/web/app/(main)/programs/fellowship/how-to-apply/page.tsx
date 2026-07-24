import React from "react";
import HowToApplyPageContent from "@/components/HowToApplyPageContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "How to Apply | GanzAfrica Fellowship - Application Guide",
  description:
    "Learn how to apply for GanzAfrica's fellowship program. Step-by-step guide to the application process, requirements, and deadlines for agriculture training fellowship.",
  keywords: [
    "GanzAfrica how to apply",
    "fellowship application guide",
    "agriculture fellowship application",
    "fellowship application process",
    "apply GanzAfrica fellowship",
    "fellowship requirements",
    "agriculture training application",
  ],
  openGraph: {
    title: "How to Apply | GanzAfrica Fellowship - Application Guide",
    description:
      "Step-by-step guide to applying for GanzAfrica's agriculture fellowship program. Learn about requirements, deadlines, and the application process.",
    siteName: "GanzAfrica",
    type: "website",
    url: `${baseUrl}/programs/fellowship/how-to-apply`,
    images: [
      {
        url: `${baseUrl}/images/Welcoming.jpg`,
        width: 1200,
        height: 630,
        alt: "GanzAfrica How to Apply",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Apply | GanzAfrica Fellowship",
    description: "Step-by-step guide to applying for GanzAfrica's fellowship program.",
    creator: "@GanzAfrica",
    images: [`${baseUrl}/images/Welcoming.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${baseUrl}/programs/fellowship/how-to-apply`,
  },
};
export default async function HowToApplyPage() {
  return (
    <>
      <HowToApplyPageContent />
    </>
  );
}
