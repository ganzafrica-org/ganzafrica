import { Metadata } from "next";
import OurImpactContent from "@/components/OurImpactContent";

export const metadata: Metadata = {
    title: "Our Impact | GanzAfrica",
    description: "Discover GanzAfrica's holistic training, mentorship, and work placements preparing African youth for careers in agriculture, sustainable land management, environment, and data-driven decision-making.",
    keywords: [
        "GanzAfrica approach",
        "agriculture training Africa",
        "sustainable land management",
        "environmental careers youth",
        "fellowship program Africa",
        "data literacy agriculture"
    ],
    openGraph: {
        title: "Our Approach to Training Africa's Future Leaders | GanzAfrica",
        description: "GanzAfrica runs holistic programs combining training, mentorship, and placements for youth in agriculture, land rights, environment, and data analytics to build prosperous African futures.",
        siteName: "ganzafrica.org",
        type: "website",
        url: "https://web.ganzafrica.org/about/our-impact"
    },
    twitter: {
        card: "summary_large_image",
        title: "GanzAfrica's Approach: Training Youth for Agri-Food Transformation",
        description: "Join GanzAfrica's fellowship: training, mentorship, and placements in agriculture, sustainable land use, environment, data skills for impactful careers across Africa.",
        images: [
            {
                url: "https://ganzafrica.org/og-our-approach.jpg", // Add a 1200x630 image
                width: 1200,
                height: 630,
                alt: "GanzAfrica fellowship program"
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

export default function Page() {
    return <OurImpactContent />;
}