import { Metadata } from 'next';

// Generate a standard metadata object with defaults
export function generateMetadata({
                                     title,
                                     description,
                                     locale = 'en',
                                     imagePath,
                                 }: {
    title: string;
    description: string;
    locale?: string;
    imagePath?: string;
}): Metadata {
    const siteName = 'GanzAfrica';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const ogImage = imagePath || '/images/og-default.jpg';

    return {
        title: {
            default: title,
            template: `%s | ${siteName}`,
        },
        description,
        openGraph: {
            type: 'website',
            locale,
            url: baseUrl,
            siteName,
            title,
            description,
            images: [{
                url: `${baseUrl}${ogImage}`,
                width: 1200,
                height: 630,
                alt: title,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${baseUrl}${ogImage}`],
        },
        alternates: {
            canonical: `${baseUrl}`,
            languages: {
                en: `${baseUrl}/en`,
                fr: `${baseUrl}/fr`,
            },
        },
    };
}

// Generate structured data for SEO (JSON-LD)
export function generateStructuredData(data: any): any {
    // Basic organization schema
    if (data.type === 'Organization') {
        return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: data.name,
            url: data.url,
            logo: `${data.url}/logo.png`,
            description: data.description,
            sameAs: data.socialLinks || [],
        };
    }

    // Basic article schema
    if (data.type === 'Article') {
        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: data.title,
            description: data.description,
            image: data.image,
            datePublished: data.datePublished,
            dateModified: data.dateModified || data.datePublished,
            author: {
                '@type': 'Person',
                name: data.author,
            },
            publisher: {
                '@type': 'Organization',
                name: 'GanzAfrica',
                logo: {
                    '@type': 'ImageObject',
                    url: `${data.baseUrl}/logo.png`,
                },
            },
        };
    }

    // Basic event schema
    if (data.type === 'Event') {
        return {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            location: {
                '@type': 'Place',
                name: data.location.name,
                address: data.location.address,
            },
            organizer: {
                '@type': 'Organization',
                name: 'GanzAfrica',
                url: data.url,
            },
        };
    }

    // Return a simple default
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: data.title || 'GanzAfrica',
        description: data.description || '',
    };
}