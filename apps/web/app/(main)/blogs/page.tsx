import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    // You can also fetch post data here to get the actual title/desc from a database
    const title = `Blog Post - ${params.slug} | GanzAfrica`;
    const description = "Read our latest insights on sustainable agriculture and land management.";

    return {
        title: title,
        description: description,
        keywords: ["agriculture Africa blog", "sustainable farming Africa"], // add the rest of your keywords
        openGraph: {
            title: title,
            description: description,
            siteName: "web.ganzafrica.org",
            type: "article",
            url: `https://web.ganzafrica.org/blogs/${params.slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title: title,
            description: description,
            creator: "@GanzAfrica",
        },
        // Keep your robots settings here if needed
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <article className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary-green">
                    Blog Post: {params.slug}
                </h1>
                <div className="prose prose-lg">
                    <p>This is a placeholder for the blog post content.</p>
                </div>
            </article>
        </div>
    );
}