import { Metadata } from "next";
import apiClient from "@/lib/api-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const response = await apiClient.get(`/fellowships/${params.id}`);
        const fellowship = response.data?.fellowship || response.data;
        const title = fellowship.title || fellowship.name || "Fellowship";

        return {
            metadataBase: new URL(baseUrl),
            title: `Apply to ${title} | GanzAfrica Fellowship`,
            description: `Apply for ${title} fellowship at GanzAfrica. ${fellowship.description?.substring(0, 120) || "Join our comprehensive agriculture training and mentorship program."}`,
            keywords: [
                "GanzAfrica fellowship apply",
                "agriculture fellowship application",
                "fellowship application",
                title
            ],
            openGraph: {
                title: `Apply to ${title} | GanzAfrica`,
                description: `Application open for ${title} fellowship. Join GanzAfrica's agriculture training program.`,
                siteName: "GanzAfrica",
                type: "website",
                url: `${baseUrl}/programs/fellowship/${params.id}/apply`,
                images: [{
                    url: `${baseUrl}/images/og/fellowship-apply.jpg`,
                    width: 1200,
                    height: 630,
                    alt: `Apply to ${title}`
                }]
            },
            twitter: {
                card: "summary_large_image",
                title: `Apply to ${title} | GanzAfrica`,
                description: `Applications open for ${title} fellowship.`,
                creator: "@GanzAfrica",
                images: [`${baseUrl}/images/og/fellowship-apply.jpg`]
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
                canonical: `${baseUrl}/programs/fellowship/${params.id}/apply`
            }
        };
    } catch (error) {
        return {
            metadataBase: new URL(baseUrl),
            title: "Apply to Fellowship | GanzAfrica",
            description: "Apply for GanzAfrica's fellowship program.",
            alternates: {
                canonical: `${baseUrl}/programs/fellowship/${params.id}/apply`
            }
        };
    }
}

export default function FellowshipApplyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}


