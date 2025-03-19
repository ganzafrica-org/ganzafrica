"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from '@/components/ui/loading';

// Properly typed dynamic imports
const Header = dynamic(() => import('@/components/layout/header'), {
    loading: () => <div className="h-16 bg-transparent"></div>
});

const Footer = dynamic(() => import('@/components/layout/footer'));

// Lazily load the CloudflareSpeedInsights component
const CloudflareSpeedInsights = dynamic(
    () => import('@/components/analytics/cloudflare-analytics').then(mod => ({ default: mod.CloudflareSpeedInsights })),
    { ssr: false }
);

// Lazily load the Providers component
const Providers = dynamic(() => import('@/components/providers').then(mod => ({ default: mod.Providers })));

export default function ClientLayout({
                                         children,
                                         locale,
                                         dict
                                     }: {
    children: React.ReactNode;
    locale: string;
    dict: any;
}) {
    return (
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
            <CloudflareSpeedInsights />
        </Providers>
    );
}