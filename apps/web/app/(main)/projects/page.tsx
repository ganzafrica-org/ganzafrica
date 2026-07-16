import React from "react";
import ProjectsPageContent from "@/components/ProjectsPageContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Projects | GanzAfrica - Agriculture & Sustainability Projects",
  description:
    "Explore GanzAfrica's impactful projects in agriculture, sustainable land management, food systems transformation, and environmental conservation across Africa.",
  keywords: [
    "GanzAfrica projects",
    "agriculture projects Africa",
    "sustainable farming projects",
    "land management projects",
    "food systems projects",
    "environmental projects Africa",
    "agriculture impact projects",
  ],
  openGraph: {
    title: "Projects | GanzAfrica - Agriculture & Sustainability Projects",
    description:
      "Discover GanzAfrica's impactful projects transforming agriculture and food systems across Africa.",
    siteName: "GanzAfrica",
    type: "website",
    url: `${baseUrl}/projects`,
    images: [
      {
        url: `${baseUrl}/images/maize.avif`,
        width: 1200,
        height: 630,
        alt: "GanzAfrica Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | GanzAfrica",
    description:
      "Explore GanzAfrica's impactful agriculture and sustainability projects across Africa.",
    creator: "@GanzAfrica",
    images: [`${baseUrl}/images/maize.avif`],
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
    canonical: `${baseUrl}/projects`,
  },
};

type Params = { locale: string };

export default async function ProjectsPage({ params }: { params: Params }) {
  const { locale } = params;

  return (
    <>
      <ProjectsPageContent />
    </>
  );
}
