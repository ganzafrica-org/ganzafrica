import {Metadata} from "next";
import NewsroomPage from "@/components/NewsroomPage";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Newsroom | GanzAfrica - Latest News & Updates",
    description: "Stay updated with GanzAfrica's latest news: fellowship cohorts, agriculture training milestones, sustainable land management projects, and food systems transformation across Africa.",
    keywords: [
        "GanzAfrica news",
        "agriculture news Africa",
        "fellowship program updates",
        "sustainable farming news",
        "agriculture training updates",
        "food systems news",
        "agriculture announcements"
    ],
    openGraph: {
        title: "Newsroom | GanzAfrica - Latest News & Updates",
        description: "Stay updated on GanzAfrica's agriculture training programs, new fellowship cohorts, and sustainability initiatives.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/newsroom`,
        images: [{
            url: `${baseUrl}/images/og/newsroom.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica Newsroom"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Newsroom | GanzAfrica",
        description: "Stay updated with GanzAfrica's latest news and updates on agriculture training and sustainability.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/newsroom.jpg`]
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
        canonical: `${baseUrl}/newsroom`
    }
};

export default async function OurStoryPage(): Promise<JSX.Element> {
    return <NewsroomPage/>;
}