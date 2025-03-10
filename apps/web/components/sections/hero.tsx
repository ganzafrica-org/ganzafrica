import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

interface HeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
}

export default function Hero({ title, subtitle, ctaText, ctaLink }: HeroProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-primary/80 to-primary py-20">
            {/* Content container */}
            <div className="container mx-auto px-4 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl">
                    {title}
                </h1>

                <p className="text-xl text-white/90 mb-10 max-w-2xl">
                    {subtitle}
                </p>

                <Link href={ctaLink} prefetch={true}>
                    <Button size="lg" variant="secondary" className="text-primary font-medium">
                        {ctaText}
                    </Button>
                </Link>
            </div>
        </section>
    );
}