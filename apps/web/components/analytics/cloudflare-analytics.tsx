// apps/web/components/analytics/cloudflare-analytics.tsx
"use client";

import Script from 'next/script';

export function CloudflareAnalytics({ token }: { token?: string }) {
    // Only include the beacon if a token is provided
    if (!token) return null;

    return (
        <>
            {/* Cloudflare Web Analytics */}
            <Script
                id="cloudflare-analytics"
                strategy="afterInteractive"
                defer
                src="https://static.cloudflareinsights.com/beacon.min.js"
                data-cf-beacon={`{"token": "${token}"}`}
            />
        </>
    );
}

export function CloudflareSpeedInsights() {
    return (
        <>
            {/* Cloudflare Web Vitals Monitoring */}
            <Script
                id="cloudflare-web-vitals"
                strategy="afterInteractive"
            >
                {`
          // Simple web vitals reporting
          function sendToCloudflare(metric) {
            // You would normally send these metrics to a custom endpoint that logs to Cloudflare
            console.log('Web Vital:', metric.name, metric.value);
            
            // Example of how you might log this with a Cloudflare Worker
            if (navigator.sendBeacon) {
              const url = '/api/vitals';
              const data = JSON.stringify({
                name: metric.name,
                value: metric.value,
                id: metric.id,
                page: window.location.pathname,
              });
              navigator.sendBeacon(url, data);
            }
          }

          // Use web-vitals when available
          import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(sendToCloudflare);
            getFID(sendToCloudflare);
            getFCP(sendToCloudflare);
            getLCP(sendToCloudflare);
            getTTFB(sendToCloudflare);
          }).catch(err => console.error('Error loading web-vitals', err));
        `}
            </Script>
        </>
    );
}