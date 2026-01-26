import { Metadata } from "next";

// Generate a standard metadata object with defaults
export function generateMetadata({
                                   params,
                                   title,
                                   description,
                                   imagePath,
                                 }: {
  params: string;
  title: string;
  description: string;
  imagePath?: string;
}): Metadata {
  const siteName = "GanzAfrica";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const ogImage = imagePath || "/images/og-default.jpg";

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      url: baseUrl,
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
      images: [`${baseUrl}${ogImage}`],
    },
    alternates: {
      canonical: `${baseUrl}`,
    },
  };
}