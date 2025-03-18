import { getDictionary } from "@/lib/get-dictionary";
import HomeHero from "@/components/sections/home-hero";
import { Metadata } from "next";
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);

  return baseGenerateMetadata({
    title: dict.site.name,
    description: dict.site.description,
    locale: params.locale,
    imagePath: "/images/og/home.jpg",
  });
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const dict = await getDictionary(locale);

  return (
    <main>
      <HomeHero locale={locale} dict={dict} />

      {/* Other homepage sections would go here */}
    </main>
  );
}

// Also export static params for static generation
export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}
