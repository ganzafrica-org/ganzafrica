import React from "react";
import FellowshipPageContent from "@/components/FellowshipPageContent";
import {Metadata} from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Fellowship Program | GanzAfrica - Agriculture Training Fellowship",
    description: "Join GanzAfrica's fellowship program: comprehensive agriculture training, mentorship, and work placements for African youth in sustainable land management and data-driven decision-making.",
    keywords: [
        "GanzAfrica fellowship",
        "agriculture fellowship program",
        "fellowship training Africa",
        "agriculture mentorship",
        "sustainable farming fellowship",
        "agriculture career training",
        "fellowship opportunities Africa"
    ],
    openGraph: {
        title: "Fellowship Program | GanzAfrica - Agriculture Training Fellowship",
        description: "Join GanzAfrica's comprehensive fellowship program combining agriculture training, mentorship, and work placements for African youth.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/programs/fellowship`,
        images: [{
            url: `${baseUrl}/images/GroupMico.jpeg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica Fellowship Program"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Fellowship Program | GanzAfrica",
        description: "Join GanzAfrica's agriculture fellowship program for comprehensive training and mentorship.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/GroupMico.jpeg`]
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
        canonical: `${baseUrl}/programs/fellowship`
    }
};

type Params = Promise<string>;

export default async function FellowshipPage({ params }: { params: Params }) {

  return (
    <>
      <FellowshipPageContent />
    </>
  );
}