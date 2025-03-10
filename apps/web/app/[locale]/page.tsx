import { getDictionary } from '@/lib/get-dictionary';
import Hero from '@/components/sections/hero';
import {redirect} from "next/navigation";

export default async function HomePage({
                                           params: { locale },
                                       }: {
    params: { locale: string };
}) {
    const dict = await getDictionary(locale);

    return (
        <main>
            <Hero
                title={dict.home.hero.title}
                subtitle={dict.home.hero.subtitle}
                ctaText={dict.home.hero.cta}
                ctaLink={`/${locale}/programs`}
            />

            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">This is the Home Page</h2>
                <p className="text-muted-foreground">
                    This is a simple placeholder for the GanzAfrica home page content.
                </p>
            </div>
        </main>
    );
}