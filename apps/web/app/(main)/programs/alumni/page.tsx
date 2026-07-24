import React from "react";
import AlumniPageContent from "@/components/AlumniPageContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Alumni | GanzAfrica - Fellowship Program Alumni Network",
  description:
    "Meet GanzAfrica's alumni network: successful graduates of our agriculture fellowship program making an impact in sustainable farming, land management, and food systems across Africa.",
  keywords: [
    "GanzAfrica alumni",
    "alumni network",
    "agriculture program graduates",
    "GanzAfrica success stories",
    "fellowship alumni network",
    "agriculture training graduates",
    "alumni achievements",
  ],
  openGraph: {
    title: "Alumni | GanzAfrica - Fellowship Program Alumni Network",
    description:
      "Discover GanzAfrica's alumni network and success stories from our agriculture fellowship program graduates.",
    siteName: "GanzAfrica",
    type: "website",
    url: `${baseUrl}/programs/alumni`,
    images: [
      {
        url: `${baseUrl}/images/hero-background.png`,
        width: 1200,
        height: 630,
        alt: "GanzAfrica Alumni",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alumni | GanzAfrica",
    description:
      "Meet GanzAfrica's alumni network and discover success stories from our fellowship program.",
    creator: "@GanzAfrica",
    images: [`${baseUrl}/images/hero-background.png`],
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
    canonical: `${baseUrl}/programs/alumni`,
  },
};

export default async function AlumniPage() {
  return <AlumniPageContent />;
}
