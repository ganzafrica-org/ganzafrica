import { Metadata } from "next";

// Generate a standard metadata object with defaults
export function generateMetadata({
  params,
  title,
  description,
  imagePath,
  keywords,
  url,
}: {
  params: string;
  title: string;
  description: string;
  imagePath?: string;
  keywords?: string[];
  url?: string;
}): Metadata {
  const siteName = "GanzAfrica";
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://web.ganzafrica.org").replace(
    /\/$/,
    "",
  );
  const ogImage = imagePath || "/images/og-default.jpg";
  const canonicalUrl = url || baseUrl + params;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: keywords || [
      "GanzAfrica",
      "agriculture training Africa",
      "sustainable farming",
      "fellowship program",
      "food systems transformation",
    ],
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@GanzAfrica",
      images: [`${baseUrl}${ogImage}`],
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
      canonical: canonicalUrl,
    },
  };
}
