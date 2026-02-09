import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "FAQs | GanzAfrica - Frequently Asked Questions",
    description: "Find answers to frequently asked questions about GanzAfrica's fellowship programs, agriculture training, application process, and opportunities for African youth.",
    keywords: [
        "GanzAfrica FAQs",
        "GanzAfrica questions",
        "fellowship program FAQs",
        "agriculture training questions",
        "GanzAfrica application process",
        "fellowship eligibility",
        "agriculture training Africa"
    ],
    openGraph: {
        title: "FAQs | GanzAfrica - Frequently Asked Questions",
        description: "Get answers to common questions about GanzAfrica's agriculture training programs, fellowships, and opportunities for African youth.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/faqs`,
        images: [{
            url: `${baseUrl}/images/og/faqs.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica FAQs"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "FAQs | GanzAfrica",
        description: "Find answers to frequently asked questions about GanzAfrica's programs and opportunities.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/faqs.jpg`]
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
        canonical: `${baseUrl}/faqs`
    }
};

export default function FAQsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}


