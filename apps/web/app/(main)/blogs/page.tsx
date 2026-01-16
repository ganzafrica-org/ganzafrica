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

export function generateMetadata({ params }: { params: { slug: string } }) {
    return {
        title: `Blog Post - ${params.slug}`,
        description: "Read our latest blog post",
    };
}