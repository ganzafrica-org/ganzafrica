import OpportunitiesPage from "@/components/OpportunitiesContent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Apply Now | GanzAfrica Fellowship",
    description: "Apply for GanzAfrica agriculture fellowship: training, mentorship, work placements in sustainable farming and land management.",
    keywords: [
        "GanzAfrica apply",
        "agriculture fellowship application",
        "apply agriculture training",
        "fellowship application Africa"
    ],
    openGraph: {
        title: "Apply to GanzAfrica Fellowship",
        description: "Application open: agriculture training + mentorship + career placements.",
        siteName: "web.ganzafrica.org",
        type: "website",
        url: "https://web.ganzafrica.org/opportunities/[id]/apply"
    },
    twitter: {
        card: "summary",
        title: "Apply: GanzAfrica Fellowship",
        description: "Applications open for agriculture training program."
    },
    robots: { index: true, follow: true }
};

export default async function OurStoryPage(): Promise<JSX.Element> {
    return <OpportunitiesPage/>;
}