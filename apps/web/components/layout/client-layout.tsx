"use client";

import { Suspense } from "react";
import Loading from "@/components/ui/loading";

// Import directly instead of using dynamic
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import dynamic from "next/dynamic";

// Keep only necessary dynamic imports
const CloudflareSpeedInsights = dynamic(
  () =>
    import("@/components/analytics/cloudflare-analytics").then((mod) => ({
      default: mod.CloudflareSpeedInsights,
    })),
  { ssr: false },
);

// Lazily load the Providers component
const Providers = dynamic(() =>
  import("@/components/providers").then((mod) => ({ default: mod.Providers })),
);

export default function ClientLayout({
  children,
  locale,
  dict,
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
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
        <Footer locale={locale} dict={dict} />
      </div>
      <CloudflareSpeedInsights />
    </Providers>
  );
}
