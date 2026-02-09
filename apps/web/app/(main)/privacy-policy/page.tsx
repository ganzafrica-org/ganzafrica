import PrivacyPolicyContent from "@/components/PrivacyPolicyContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Privacy Policy | GanzAfrica - privacy & policy",
    description: "Learn how GanzAfrica collects, uses, and protects your personal data. We are committed to transparency and safeguarding your privacy across our operations.",
    keywords: [
        "GanzAfrica privacy policy",
        "data protection Africa",
        "GDPR compliance Africa",
        "privacy and policy GanzAfrica",
        "personal data security",
        "data transparency",
        "user privacy rights"
    ],
    openGraph: {
        title: "Privacy Policy | GanzAfrica - Protecting Your Data",
        description: "Our commitment to your privacy. Learn about how GanzAfrica handles your information with care and transparency.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/privacy-policy`,
        images: [{
            url: `${baseUrl}/images/SHIR5142-Enhanced-NR.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica Privacy Policy"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy | GanzAfrica",
        description: "Your data privacy is our priority. Read GanzAfrica's privacy policy to understand how we protect your information.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/SHIR5142-Enhanced-NR.jpg`]
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
        canonical: `${baseUrl}/privacy-policy`
    }
};

export default async function PrivacyPolicyPage(): Promise<JSX.Element> {
    return <PrivacyPolicyContent />;
}