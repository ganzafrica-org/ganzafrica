import React from "react";
import Header from "@/components/layout/header";
import OurApproachPageContent from "@/components/OurApproachPageContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Our Approach | GanzAfrica",
  description:
    "Discover GanzAfrica's holistic training, mentorship, and work placements preparing African youth for careers in agriculture, sustainable land management, environment, and data-driven decision-making.",
  keywords: [
    "GanzAfrica approach",
    "agriculture training Africa",
    "sustainable land management",
    "environmental careers youth",
    "fellowship program Africa",
    "data literacy agriculture",
  ],
  openGraph: {
    title: "Our Approach to Training Africa's Future Leaders | GanzAfrica",
    description:
      "GanzAfrica runs holistic programs combining training, mentorship, and placements for youth in agriculture, land rights, environment, and data analytics to build prosperous African futures.",
    siteName: "GanzAfrica",
    type: "website",
    url: "https://web.ganzafrica.org/about/our-approach",
    images: [
      {
        url: `${baseUrl}/images/cabbages.png`,
        width: 1200,
        height: 630,
        alt: "GanzAfrica - our approach",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GanzAfrica's Approach: Training Youth for Agri-Food Transformation",
    description:
      "Join GanzAfrica's fellowship: training, mentorship, and placements in agriculture, sustainable land use, environment, data skills for impactful careers across Africa.",
    images: [
      {
        url: `${baseUrl}/images/cabbages.png`, // Add a 1200x630 image
        width: 1200,
        height: 630,
        alt: "GanzAfrica - our approach",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default async function OurApproachPage() {
  return (
    <>
      <Header />
      <OurApproachPageContent />
    </>
  );
}
