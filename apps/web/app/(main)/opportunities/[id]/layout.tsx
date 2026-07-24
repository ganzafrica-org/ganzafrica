import { Metadata } from "next";
import apiClient from "@/lib/api-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await apiClient.get(`/opportunities/${params.id}`);
    const opportunity = response.data?.opportunity || response.data;

    const title = opportunity.title || "Opportunity";
    const description =
      opportunity.description?.substring(0, 160) || "Discover this opportunity at GanzAfrica.";

    return {
      metadataBase: new URL(baseUrl),
      title: `${title} | GanzAfrica Opportunities`,
      description,
      keywords: [
        "GanzAfrica opportunities",
        "agriculture opportunities",
        opportunity.type || "fellowship",
        "sustainable farming",
        title,
      ],
      openGraph: {
        title: `${title} | GanzAfrica`,
        description,
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/opportunities/${params.id}`,
        images: [
          {
            url: `${baseUrl}/images/og/opportunities.jpg`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | GanzAfrica`,
        description,
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/opportunities.jpg`],
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
        canonical: `${baseUrl}/opportunities/${params.id}`,
      },
    };
  } catch (error) {
    return {
      metadataBase: new URL(baseUrl),
      title: "Opportunity Details | GanzAfrica",
      description: "Discover this opportunity at GanzAfrica.",
      alternates: {
        canonical: `${baseUrl}/opportunities/${params.id}`,
      },
    };
  }
}

export default function OpportunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
