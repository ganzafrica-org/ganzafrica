import {Metadata} from "next";
import OpportunitiesPage from "@/components/OpportunitiesContent";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Opportunities | GanzAfrica - Careers, Fellowships & Training Programs",
    description: "Discover career opportunities, fellowships, and training programs in agriculture, sustainable land management, and data analytics for African youth at GanzAfrica.",
    keywords: [
        "GanzAfrica opportunities",
        "agriculture jobs Africa",
        "fellowship opportunities",
        "sustainable land careers",
        "agriculture training programs",
        "career opportunities Africa",
        "agriculture fellowships"
    ],
    openGraph: {
        title: "Opportunities | GanzAfrica - Careers, Fellowships & Training Programs",
        description: "Explore career opportunities, fellowships, and training programs in agriculture and sustainability for African youth.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/opportunities`,
        images: [{
            url: `${baseUrl}/images/og/opportunities.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica Opportunities"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Opportunities | GanzAfrica",
        description: "Discover career opportunities, fellowships, and training programs at GanzAfrica.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/opportunities.jpg`]
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
        canonical: `${baseUrl}/opportunities`
    }
};

export default async function OurStoryPage(): Promise<JSX.Element> {
    return <OpportunitiesPage/>;
}