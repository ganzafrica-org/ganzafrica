import { Metadata } from "next";
import OurImpactContent from "@/components/OurImpactContent";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Our Impact | GanzAfrica - Transforming Agriculture Across Africa",
  description:
    "Discover GanzAfrica's impact: transforming agriculture, empowering youth, and building sustainable food systems across Africa through training, mentorship, and innovative projects.",
  keywords: [
    "GanzAfrica impact",
    "agriculture impact Africa",
    "youth empowerment impact",
    "sustainable farming impact",
    "food systems transformation",
    "agriculture training results",
    "fellowship program impact",
  ],
  openGraph: {
    title: "Our Impact | GanzAfrica - Transforming Agriculture Across Africa",
    description:
      "See how GanzAfrica is transforming agriculture and empowering African youth through comprehensive training and sustainable food systems.",
    siteName: "GanzAfrica",
    type: "website",
    url: `${baseUrl}/our-impact`,
    images: [
      {
        url: `${baseUrl}/images/og/our-impact.jpg`,
        width: 1200,
        height: 630,
        alt: "GanzAfrica Impact",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Impact | GanzAfrica",
    description:
      "Discover GanzAfrica's impact transforming agriculture and empowering youth across Africa.",
    creator: "@GanzAfrica",
    images: [`${baseUrl}/images/og/our-impact.jpg`],
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
    canonical: `${baseUrl}/our-impact`,
  },
};

export default function Page() {
  return <OurImpactContent />;
}
