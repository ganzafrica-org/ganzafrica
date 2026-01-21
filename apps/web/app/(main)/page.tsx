import { getDictionary } from "@/lib/get-dictionary";
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
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale;
  const dict = await getDictionary(locale);

  return baseGenerateMetadata({
    params: { locale },
    title: dict.site.name,
    description: dict.site.description,
    locale,
    imagePath: "/images/og/home.jpg",
  });
}

export default async function HomePage({ params }: PageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return (
    <main>
      <FellowsSection locale={locale} />
      <WhyGanzAfricaSection locale={locale} />
      <GanzAfricaUniqueSection locale={locale} />
      <FlagshipProgramsSection locale={locale} dict={undefined} />
      <ProjectsSection locale={locale} />
      <PartnersSection locale={locale} />
      <TestimonialsSection locale={locale} />
      <LatestNewsSection locale={locale} />
      <NewsletterSection locale={locale} dict={undefined} />
    </main>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}