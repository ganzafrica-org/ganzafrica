import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Blog | GanzAfrica - Agriculture & Sustainability Insights",
  description:
    "Read GanzAfrica's latest blog posts on sustainable agriculture, land management, food systems transformation, and youth empowerment across Africa.",
  keywords: [
    "GanzAfrica blog",
    "agriculture blog Africa",
    "sustainable farming blog",
    "food systems blog",
    "agriculture insights",
    "sustainable agriculture articles",
    "land management blog",
  ],
  openGraph: {
    title: "Blog | GanzAfrica - Agriculture & Sustainability Insights",
    description:
      "Read GanzAfrica's latest insights on sustainable agriculture, land management, and food systems transformation.",
    siteName: "GanzAfrica",
    type: "website",
    url: `${baseUrl}/blogs`,
    images: [
      {
        url: `${baseUrl}/images/og/blog.jpg`,
        width: 1200,
        height: 630,
        alt: "GanzAfrica Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | GanzAfrica",
    description: "Read GanzAfrica's latest insights on agriculture and sustainability.",
    creator: "@GanzAfrica",
    images: [`${baseUrl}/images/og/blog.jpg`],
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
    canonical: `${baseUrl}/blogs`,
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-primary-green">Blog Post: {params.slug}</h1>
        <div className="prose prose-lg">
          <p>This is a placeholder for the blog post content.</p>
        </div>
      </article>
    </div>
  );
}
