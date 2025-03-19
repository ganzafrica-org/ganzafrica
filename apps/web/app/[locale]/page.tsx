import { getDictionary } from "@/lib/get-dictionary";
import HomeHero from "@/components/sections/home-hero";
import FellowsSection from "@/components/sections/fellows-section";
import WhyGanzAfricaSection from "@/components/sections/why-ganzafrica-section";
import FlagshipProgramsSection from "@/components/sections/flagship-programs-section";
import ProjectsSection from "@/components/sections/projects-section";
import { Metadata } from "next";
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata";

// Generate metadata for SEO
export async function generateMetadata({
                                           params,
                                       }: {
    params: { locale: string };
}): Promise<Metadata> {
    const locale = params.locale;
    const dict = await getDictionary(locale);

    return baseGenerateMetadata({
        title: dict.site.name,
        description: dict.site.description,
        locale,
        imagePath: "/images/og/home.jpg",
    });
}

export default async function HomePage({
                                           params: { locale },
                                       }: {
    params: { locale: string };
}) {
    const dict = await getDictionary(locale);

    return (
        <main>
            <HomeHero locale={locale} dict={dict} />
            <FellowsSection locale={locale} dict={dict} />
            <WhyGanzAfricaSection locale={locale} dict={dict} />
            <FlagshipProgramsSection locale={locale} dict={dict} />
            <ProjectsSection locale={locale} dict={dict} />
        </main>
    );
}

export async function generateStaticParams() {
    return [{ locale: "en" }, { locale: "fr" }];
}