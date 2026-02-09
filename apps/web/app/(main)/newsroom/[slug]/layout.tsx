import { Metadata } from "next";
import apiClient from "@/lib/api-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const response = await apiClient.get("/news");
        const articles = response.data?.news || response.data || [];
        
        // Find article by slug (generate slug from title)
        const generateSlug = (title: string) => {
            if (!title) return "";
            return title
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
        };

        const article = articles.find((a: { title: string }) => generateSlug(a.title) === params.slug);
        
        if (article) {
            const title = article.title;
            const description = article.description || article.content?.substring(0, 160) || "Read GanzAfrica's latest news and updates.";

            return {
                metadataBase: new URL(baseUrl),
                title: `${title} | GanzAfrica News`,
                description,
                keywords: [
                    "GanzAfrica news",
                    "agriculture news",
                    article.tags?.map((t: { name: string }) => t.name).join(", ") || "sustainable farming",
                    "food systems"
                ],
                openGraph: {
                    title: `${title} | GanzAfrica`,
                    description,
                    siteName: "GanzAfrica",
                    type: "article",
                    url: `${baseUrl}/newsroom/${params.slug}`,
                    publishedTime: article.publish_date || article.created_at,
                    authors: article.author ? [article.author] : undefined,
                    tags: article.tags?.map((t: { name: string }) => t.name),
                    images: article.media?.items?.find((m: { cover: boolean }) => m.cover)?.url ? [{
                        url: article.media.items.find((m: { cover: boolean }) => m.cover).url,
                        width: 1200,
                        height: 630,
                        alt: title
                    }] : [{
                        url: `${baseUrl}/images/og/newsroom.jpg`,
                        width: 1200,
                        height: 630,
                        alt: title
                    }]
                },
                twitter: {
                    card: "summary_large_image",
                    title: `${title} | GanzAfrica`,
                    description,
                    creator: "@GanzAfrica",
                    images: article.media?.items?.find((m: { cover: boolean }) => m.cover)?.url ? 
                        [article.media.items.find((m: { cover: boolean }) => m.cover).url] : 
                        [`${baseUrl}/images/og/newsroom.jpg`]
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
                    canonical: `${baseUrl}/newsroom/${params.slug}`
                }
            };
        }
    } catch (error) {
        // Fallback if API fails
    }

    return {
        metadataBase: new URL(baseUrl),
        title: `News Article | GanzAfrica`,
        description: "Read GanzAfrica's latest news and updates on agriculture and sustainability.",
        alternates: {
            canonical: `${baseUrl}/newsroom/${params.slug}`
        }
    };
}

export default function NewsroomSlugLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}


