import { Metadata } from "next";
import apiClient from "@/lib/api-client";
import ProjectDetailsContent from "@/components/ProjectDetailsContent";

type Props = {
    params: { id: string };
};

// DYNAMIC METADATA: This fixes the SEO and the "Invalid URL" crash
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

    try {
        const response = await apiClient.get(`/projects/${params.id}`);
        const project = response.data?.project || response.data;
        const description = project.description?.substring(0, 160) || "Discover GanzAfrica's project impact.";

        return {
            metadataBase: new URL(baseUrl),
            title: `${project.name} | GanzAfrica Projects`,
            description,
            keywords: [
                "GanzAfrica projects",
                "agriculture projects",
                project.name,
                "sustainable farming",
                "food systems"
            ],
            openGraph: {
                title: `${project.name} | GanzAfrica`,
                description: project.description || description,
                url: `${baseUrl}/projects/${params.id}`,
                siteName: "GanzAfrica",
                type: "website",
                images: project.image ? [{
                    url: project.image,
                    width: 1200,
                    height: 630,
                    alt: project.name
                }] : [{
                    url: `${baseUrl}/images/`,
                    width: 1200,
                    height: 630,
                    alt: project.name
                }]
            },
            twitter: {
                card: "summary_large_image",
                title: `${project.name} | GanzAfrica`,
                description: project.description || description,
                creator: "@GanzAfrica",
                images: project.image ? [project.image] : [`${baseUrl}/images/og/projects.jpg`]
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
                canonical: `${baseUrl}/projects/${params.id}`
            }
        };
    } catch (error) {
        return {
            metadataBase: new URL(baseUrl),
            title: "Project Details | GanzAfrica",
            description: "Discover GanzAfrica's project impact.",
            alternates: {
                canonical: `${baseUrl}/projects/${params.id}`
            }
        };
    }
}

export default function Page({ params }: Props) {
    return <ProjectDetailsContent id={params.id} />;
}