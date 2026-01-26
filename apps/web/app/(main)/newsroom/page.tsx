import {Metadata} from "next";
import NewsroomPage from "@/components/NewsroomPage";

export const metadata: Metadata = {
    title: "News | GanzAfrica - Agriculture Updates",
    description: "Latest GanzAfrica news: fellowship cohorts, agriculture training milestones, sustainable land management projects across Africa.",
    keywords: [
        "GanzAfrica news",
        "agriculture Africa updates",
        "fellowship program news",
        "sustainable farming news"
    ],
    openGraph: {
        title: "GanzAfrica News & Updates",
        description: "Stay updated on our agriculture training programs, new fellowship cohorts, and sustainability initiatives.",
        siteName: "web.ganzafrica.org",
        type: "website",
        url: "https://web.ganzafrica.org/newsroom"
    },
    twitter: {
        card: "summary_large_image",
        title: "GanzAfrica Latest News",
        description: "Agriculture training updates, fellowship announcements, sustainability project news."
    },
    robots: {index: true, follow: true}
};

export default async function OurStoryPage(): Promise<JSX.Element> {
    return <NewsroomPage/>;
}