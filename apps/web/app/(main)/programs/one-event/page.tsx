import { Metadata } from "next";
import OneEventContent from "@/components/OneEventContent";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Events | GanzAfrica - Agriculture Training Events & Workshops",
    description: "Discover GanzAfrica's upcoming events, workshops, and training sessions on agriculture, sustainable land management, and food systems transformation across Africa.",
    keywords: [
        "GanzAfrica events",
        "agriculture workshops",
        "sustainable farming events",
        "agriculture training workshops",
        "food systems events Africa",
        "agriculture conferences",
        "training events Africa"
    ],
    openGraph: {
        title: "Events | GanzAfrica - Agriculture Training Events & Workshops",
        description: "Join GanzAfrica's events and workshops on agriculture, sustainable land management, and food systems transformation.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/programs/one-event`,
        images: [{
            url: `${baseUrl}/images/og/events.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica Events"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Events | GanzAfrica",
        description: "Discover upcoming agriculture training events and workshops from GanzAfrica.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/events.jpg`]
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
        canonical: `${baseUrl}/programs/one-event`
    }
};


export default function Page() {
    return <OneEventContent />;
}