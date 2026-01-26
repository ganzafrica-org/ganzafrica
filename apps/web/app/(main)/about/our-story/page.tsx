import OurStoryContent from "@/components/OurStoryContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Our Story | GanzAfrica - Origins & Mission",
    description: "Learn GanzAfrica's origin story: empowering African youth through agriculture training, sustainable land management, and data literacy programs since our founding.",
    keywords: [
        "GanzAfrica story",
        "GanzAfrica origins",
        "GanzAfrica mission",
        "African agriculture fellowship",
        "sustainable land management history",
        "youth empowerment Africa",
        "GanzAfrica journey"
    ],
    openGraph: {
        title: "Our Story: GanzAfrica's Journey Empowering African Youth",
        description: "Discover how GanzAfrica began its mission to transform African agriculture through training, mentorship, and real-world placements for the next generation of leaders.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/about/our-story`,
        images: [{
            url: `${baseUrl}/images/og/our-story.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica origin story"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "GanzAfrica's Story: From Vision to Impact",
        description: "How GanzAfrica built a fellowship transforming African youth into agriculture and sustainability leaders through training and mentorship.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/our-story.jpg`]
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
        canonical: `${baseUrl}/about/our-story`
    }
};

export default async function OurStoryPage(): Promise<JSX.Element> {
    return <OurStoryContent />;
}