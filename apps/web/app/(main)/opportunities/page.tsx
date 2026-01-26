import {Metadata} from "next";
import OpportunitiesPage from "@/components/OpportunitiesContent";

export const metadata: Metadata = {
    title: "Opportunities | GanzAfrica Careers",
    description: "Career opportunities, fellowships, and training programs in agriculture, sustainable land management, and data analytics for African youth.",
    keywords: [
        "GanzAfrica opportunities",
        "agriculture jobs Africa",
        "fellowship opportunities",
        "sustainable land careers"
    ],
    openGraph: {
        title: "Career Opportunities at GanzAfrica",
        description: "Agriculture fellowships, training programs, and career placements for African youth.",
        siteName: "web.ganzafrica.org",
        type: "website",
        url: "https://web.ganzafrica.org/opportunities"
    },
    twitter: {
        card: "summary_large_image",
        title: "GanzAfrica Opportunities",
        description: "Agriculture fellowships and career training programs open now."
    },
    robots: { index: true, follow: true }
};

export default async function OurStoryPage(): Promise<JSX.Element> {
    return <OpportunitiesPage/>;
}