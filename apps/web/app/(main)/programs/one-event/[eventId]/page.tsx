import { Metadata } from "next";
import OneEventContent from "@/components/OneEventContent";
import apiClient from "@/lib/api-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

type Props = {
  params: { eventId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await apiClient.get(`/events/${params.eventId}`);
    const event = response.data?.event || response.data;

    return {
      metadataBase: new URL(baseUrl),
      title: `${event.title || event.name || "Event"} | GanzAfrica Events`,
      description:
        event.description?.substring(0, 160) ||
        event.summary ||
        "Join GanzAfrica's agriculture training event.",
      keywords: [
        "GanzAfrica events",
        "agriculture workshops",
        "sustainable farming events",
        event.title || event.name || "event",
      ],
      openGraph: {
        title: `${event.title || event.name || "Event"} | GanzAfrica`,
        description:
          event.description || event.summary || "Join GanzAfrica's agriculture training event.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/programs/one-event/${params.eventId}`,
        images: event.image
          ? [
              {
                url: event.image,
                width: 1200,
                height: 630,
                alt: event.title || event.name || "Event",
              },
            ]
          : [
              {
                url: `${baseUrl}/images/og/events.jpg`,
                width: 1200,
                height: 630,
                alt: "GanzAfrica Event",
              },
            ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${event.title || event.name || "Event"} | GanzAfrica`,
        description:
          event.description || event.summary || "Join GanzAfrica's agriculture training event.",
        creator: "@GanzAfrica",
        images: event.image ? [event.image] : [`${baseUrl}/images/og/events.jpg`],
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
        canonical: `${baseUrl}/programs/one-event/${params.eventId}`,
      },
    };
  } catch (error) {
    return {
      metadataBase: new URL(baseUrl),
      title: "Event Details | GanzAfrica",
      description: "Join GanzAfrica's agriculture training event.",
      alternates: {
        canonical: `${baseUrl}/programs/one-event/${params.eventId}`,
      },
    };
  }
}

export default function Page({ params }: Props) {
  return <OneEventContent eventId={params.eventId} />;
}
