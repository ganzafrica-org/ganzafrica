import React from "react";
import Header from "@/components/layout/header";
import TeamPageContent from "@/components/TeamPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Team | GanzAfrica - Agriculture Experts",
    description: "Meet GanzAfrica's expert team driving African youth empowerment through agriculture training, sustainable land management, and data-driven solutions.",
    keywords: [
        "GanzAfrica team",
        "agriculture experts Africa",
        "sustainable land management experts",
        "African agriculture leaders",
        "fellowship program directors",
        "environmental specialists Africa",
        "agri-food transformation team"
    ],
    openGraph: {
        title: "Meet GanzAfrica's Leadership Team",
        description: "Our experts in agriculture, sustainability, and youth training are transforming Africa's agri-food future through GanzAfrica's fellowship programs.",
        siteName: "web.ganzafrica.org",
        type: "website",
        url: "https://web.ganzafrica.org/about/team"
    },
    twitter: {
        card: "summary_large_image",
        title: "GanzAfrica Team: Leading Africa's Agri-Revolution",
        description: "Discover the experts behind GanzAfrica's mission to train African youth for sustainable agriculture and land management careers.",
        creator: "@GanzAfrica",
        images: [
            {
                url: "https://ganzafrica.org/og-team.jpg",
                width: 1200,
                height: 630,
                alt: "GanzAfrica leadership team"
            }
        ]
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
            <TeamPageContent />
        </>
    );
}