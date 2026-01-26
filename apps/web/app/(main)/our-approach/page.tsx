import React from "react";
import Header from "@/components/layout/header";
import OurApproachPageContent from "@/components/OurApproachPageContent";
import {Metadata} from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Our Approach | GanzAfrica - Holistic Training Methodology",
    description: "Discover GanzAfrica's holistic approach: combining training, mentorship, and work placements to prepare African youth for careers in agriculture, sustainable land management, and data-driven decision-making.",
    keywords: [
        "GanzAfrica approach",
        "agriculture training methodology",
        "holistic training approach",
        "sustainable land management training",
        "mentorship programs",
        "work placement programs",
        "data-driven agriculture"
    ],
    openGraph: {
        title: "Our Approach | GanzAfrica - Holistic Training Methodology",
        description: "Learn about GanzAfrica's comprehensive approach combining training, mentorship, and placements for African youth in agriculture and sustainability.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/our-approach`,
        images: [{
            url: `${baseUrl}/images/og/our-approach.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica Approach"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Our Approach | GanzAfrica",
        description: "Discover GanzAfrica's holistic training approach for African youth in agriculture and sustainability.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/our-approach.jpg`]
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
        canonical: `${baseUrl}/our-approach`
    }
};

type Params = { locale: string };

export default async function OurApproachPage({ params }: { params: Params }) {

  return (
    <>
      <Header />
      <OurApproachPageContent />
    </>
  );
}