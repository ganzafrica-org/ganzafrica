import React from "react";
import ContactUsContent from "@/components/ContactUsContent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Contact Us | GanzAfrica",
    description: "Get in touch with GanzAfrica to learn about our agriculture training programs, partnership opportunities, or fellowship applications across Africa.",
    keywords: [
        "GanzAfrica contact",
        "agriculture fellowship contact",
        "sustainable farming Africa contact",
        "youth training programs contact",
        "Reach out"
    ],
    openGraph: {
        title: "Contact GanzAfrica - Agriculture Training Programs",
        description: "Connect with GanzAfrica about youth fellowships, agriculture training, sustainable land management partnerships.",
        siteName: "web.ganzafrica.org",
        type: "website",
        url: "https://web.ganzafrica.org/contact"
    },
    twitter: {
        card: "summary",
        title: "Contact GanzAfrica",
        description: "Reach out about agriculture training, fellowships, and sustainable development programs.",
        images: [{ url: "https://ganzafrica.org/og-contact.jpg", width: 1200, height: 630 }]
    },
    robots: { index: true, follow: true }
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
