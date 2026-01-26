import FellowsSection from "@/components/sections/homepage/fellows-section";
import WhyGanzAfricaSection from "@/components/sections/homepage/why-ganzafrica-section";
import FlagshipProgramsSection from "@/components/sections/homepage/flagship-programs-section";
import ProjectsSection from "@/components/sections/homepage/projects-section";
import TestimonialsSection from "@/components/sections/homepage/testimonials-section";
import PartnersSection from "@/components/sections/homepage/partners-section";
import { Metadata } from "next";
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata";
import LatestNewsSection from "@/components/sections/homepage/latest-news-section";
import NewsletterSection from "@/components/sections/newsletter-section";
import GanzAfricaUniqueSection from "@/components/sections/homepage/ganzafrica-unique-section";

// Simplified Metadata generation
export async function generateMetadata(): Promise<Metadata> {
    return baseGenerateMetadata({
        params: "",
        title: "GanzAfrica - Empowering Africa's Food System Leaders",
        description: "GanzAfrica offers innovative training, mentorship, and work placement programs preparing African youth for careers in agriculture, sustainable land management, and data-driven decision-making. Join us in transforming Africa's food systems.",
        imagePath: "/images/og/home.jpg",
        keywords: [
            "GanzAfrica",
            "agriculture training Africa",
            "sustainable farming",
            "fellowship program Africa",
            "food systems transformation",
            "youth empowerment Africa",
            "agriculture mentorship",
            "sustainable land management",
            "data-driven agriculture"
        ],
        url: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org"
    });
}

export default function HomePage() {
    return (
        <main>
            <FellowsSection />
            <WhyGanzAfricaSection />
            <GanzAfricaUniqueSection />
            <FlagshipProgramsSection />
            <ProjectsSection />
            <PartnersSection />
            <TestimonialsSection />
            <LatestNewsSection />
            <NewsletterSection />
        </main>
    );
}