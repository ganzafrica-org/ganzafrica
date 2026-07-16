import React from "react";
import ContactUsContent from "@/components/ContactUsContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Contact Us | GanzAfrica - Get in Touch",
  description:
    "Get in touch with GanzAfrica to learn about our agriculture training programs, partnership opportunities, fellowship applications, and how we can help transform food systems across Africa.",
  keywords: [
    "GanzAfrica contact",
    "agriculture fellowship contact",
    "sustainable farming Africa contact",
    "youth training programs contact",
    "GanzAfrica email",
    "agriculture training contact",
    "fellowship inquiries",
  ],
  openGraph: {
    title: "Contact Us | GanzAfrica - Get in Touch",
    description:
      "Connect with GanzAfrica about youth fellowships, agriculture training, sustainable land management partnerships, and collaboration opportunities.",
    siteName: "GanzAfrica",
    type: "website",
    url: `${baseUrl}/contact`,
    images: [
      {
        url: `${baseUrl}/images/_BAB8852.jpg`,
        width: 1200,
        height: 630,
        alt: "Contact GanzAfrica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | GanzAfrica",
    description:
      "Reach out about agriculture training, fellowships, and sustainable development programs.",
    creator: "@GanzAfrica",
    images: [`${baseUrl}/images/_BAB8852.jpg`],
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
    canonical: `${baseUrl}/contact`,
  },
};

// This function will run server-side because it's inside a Server Component
type Params = Promise<{ locale: string }>;

// This is a Server Component
export default async function ContactUsPage({ params }: { params: Params }) {
  const { locale } = await params;

  return (
    <>
      <ContactUsContent />
    </>
  );
}
