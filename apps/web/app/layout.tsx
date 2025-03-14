import { Rubik } from 'next/font/google';
import { getDictionary } from '@/lib/get-dictionary';
import { CloudflareAnalytics } from '@/components/analytics/cloudflare-analytics';
import ClientLayout from '@/components/layout/client-layout';

import '@workspace/ui/globals.css';

// Font optimization - Using Rubik
const fontRubik = Rubik({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-rubik',
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
            className={`${fontRubik.variable}`}
            suppressHydrationWarning
        >
        <body className="min-h-screen font-sans antialiased">
        <ClientLayout locale={locale} dict={dict}>
            {children}
        </ClientLayout>
        <CloudflareAnalytics token={process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN} />
        </body>
        </html>
    );
}