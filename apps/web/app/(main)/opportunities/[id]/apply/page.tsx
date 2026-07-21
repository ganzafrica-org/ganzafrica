import OpportunitiesPage from "@/components/OpportunitiesContent";
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

    return {
      metadataBase: new URL(baseUrl),
      title: `Apply to ${title} | GanzAfrica`,
      description: `Apply for ${title} at GanzAfrica. ${opportunity.description?.substring(0, 120) || "Join our agriculture training and fellowship program."}`,
      keywords: [
        "GanzAfrica apply",
        "agriculture fellowship application",
        "apply agriculture training",
        "fellowship application Africa",
        title,
      ],
      openGraph: {
        title: `Apply to ${title} | GanzAfrica`,
        description: `Application open for ${title}. Join GanzAfrica's agriculture training and fellowship program.`,
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/opportunities/${params.id}/apply`,
        images: [
          {
            url: `${baseUrl}/images/og/apply.jpg`,
            width: 1200,
            height: 630,
            alt: `Apply to ${title}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Apply to ${title} | GanzAfrica`,
        description: `Applications open for ${title} at GanzAfrica.`,
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/apply.jpg`],
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
        canonical: `${baseUrl}/opportunities/${params.id}/apply`,
      },
    };
  } catch (error) {
    return {
      metadataBase: new URL(baseUrl),
      title: "Apply | GanzAfrica",
      description: "Apply for GanzAfrica's agriculture fellowship and training programs.",
      alternates: {
        canonical: `${baseUrl}/opportunities/${params.id}/apply`,
      },
    };
  }
}

export default async function OurStoryPage(): Promise<JSX.Element> {
  return <OpportunitiesPage />;
}
