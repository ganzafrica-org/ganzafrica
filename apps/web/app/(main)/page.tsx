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

// Interface for page props with Promise-based params
interface PageProps {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: {};
}): Promise<Metadata> {
  return baseGenerateMetadata({
    params: {
        locale: "/"
    },
    title: "GanzAfrica",
    description: "GanzAfrica offers an innovative training, mentorship, and work placement program that meets both pressing needs at once—and prepares African youth to take the future in their hands.",
    imagePath: "/images/og/home.jpg",
  });
}

export default async function HomePage({ params }: PageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

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