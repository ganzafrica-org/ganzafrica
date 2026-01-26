export default function BlogPostPage({
                                         params,
                                     }: {
    params: { slug: string };
}) {
    return (
        <div className="container mx-auto px-4 py-8">
            <article className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">Blog Post: {params.slug}</h1>
                <div className="prose prose-lg">
                    <p>This is a placeholder for the blog post content.</p>
                    <p>
                        You are viewing the blog post with slug: <strong>{params.slug}</strong>
                    </p>
                </div>
            </article>
        </div>
    );
}

import { Metadata } from "next";
import apiClient from "@/lib/api-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        // Try to fetch blog post data from API
        const response = await apiClient.get(`/blogs/${params.slug}`);
        const post = response.data?.blog || response.data?.post || response.data;
        
        const title = post.title || `Blog Post - ${params.slug}`;
        const description = post.description || post.excerpt || post.content?.substring(0, 160) || "Read our latest insights on sustainable agriculture and land management.";

        return {
            metadataBase: new URL(baseUrl),
            title: `${title} | GanzAfrica Blog`,
            description,
            keywords: [
                "GanzAfrica blog",
                "agriculture blog",
                post.tags?.join(", ") || "sustainable farming",
                "food systems"
            ],
            openGraph: {
                title: `${title} | GanzAfrica`,
                description,
                siteName: "GanzAfrica",
                type: "article",
                url: `${baseUrl}/blogs/${params.slug}`,
                publishedTime: post.publishedAt || post.created_at,
                authors: post.author ? [post.author] : undefined,
                tags: post.tags,
                images: post.image ? [{
                    url: post.image,
                    width: 1200,
                    height: 630,
                    alt: title
                }] : [{
                    url: `${baseUrl}/images/og/blog.jpg`,
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
                images: post.image ? [post.image] : [`${baseUrl}/images/og/blog.jpg`]
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
                canonical: `${baseUrl}/blogs/${params.slug}`
            }
        };
    } catch (error) {
        // Fallback metadata if API fails
        return {
            metadataBase: new URL(baseUrl),
            title: `Blog Post - ${params.slug} | GanzAfrica`,
            description: "Read our latest insights on sustainable agriculture and land management.",
            alternates: {
                canonical: `${baseUrl}/blogs/${params.slug}`
            }
        };
    }
}