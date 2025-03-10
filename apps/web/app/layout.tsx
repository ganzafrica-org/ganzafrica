import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { getDictionary } from '@/lib/get-dictionary';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Loading from '@/components/ui/loading';
import { Providers } from '@/components/providers';
import { CloudflareAnalytics, CloudflareSpeedInsights } from '@/components/analytics/cloudflare-analytics';

import '@workspace/ui/globals.css';

// Font optimization
const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

// Metadata generation
export async function generateMetadata({
                                           params,
                                       }: {
    params: { locale: string };
}) {
    // Ensure locale is one of the supported ones, fallback to 'en'
    const locale = params.locale && ['en', 'fr'].includes(params.locale) ? params.locale : 'en';

    // Load dictionary based on locale
    const dict = await getDictionary(locale);

    return {
        title: {
            default: dict.site.name,
            template: `%s | ${dict.site.name}`,
        },
        description: dict.site.description,
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ganzafrica.org'),
        alternates: {
            canonical: '/',
            languages: {
                en: '/en',
                fr: '/fr',
            },
        },
    };
}

export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Ensure locale is one of the supported ones, fallback to 'en'
    const locale = params.locale && ['en', 'fr'].includes(params.locale) ? params.locale : 'en';
    const dict = await getDictionary(locale);

    return (
        <html
            lang={locale}
            className={`${fontSans.variable} ${fontMono.variable}`}
            suppressHydrationWarning
        >
        <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
            <div className="relative flex min-h-screen flex-col">
                <Header locale={locale} dict={dict} />
                <div className="flex-1">
                    <Suspense fallback={<Loading />}>
                        {children}
                    </Suspense>
                </div>
                <Footer locale={locale} dict={dict} />
            </div>
        </Providers>
        <CloudflareAnalytics token={process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN} />
        <CloudflareSpeedInsights />
        </body>
        </html>
    );
}