import { Metadata } from "next";
import apiClient from "@/lib/api-client";
import ProjectDetailsContent from "@/components/ProjectDetailsContent";

type Props = {
    params: { id: string };
};

// DYNAMIC METADATA: This fixes the SEO and the "Invalid URL" crash
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://ganzafrica.org";

    try {
        const response = await apiClient.get(`/projects/${params.id}`);
        const project = response.data?.project || response.data;

        return {
            metadataBase: new URL(baseUrl), // Ensures robots.txt and sitemap work perfectly
            title: `${project.name} | GanzAfrica Projects`,
            description: project.description?.substring(0, 160) || "Discover GanzAfrica's project impact.",
            openGraph: {
                title: project.name,
                description: project.description,
                url: `${baseUrl}/projects/${params.id}`,
                siteName: "GanzAfrica",
                type: "website",
            },
        };
    } catch (error) {
        return {
            metadataBase: new URL(baseUrl),
            title: "Project Details | GanzAfrica",
        };
    }
}

export default function Page({ params }: Props) {
    return <ProjectDetailsContent id={params.id} />;
}