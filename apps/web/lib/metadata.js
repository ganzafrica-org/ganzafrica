// Generate a standard metadata object with defaults
export function generateMetadata({ params, title, description, locale = "en", imagePath, }) {
    const siteName = "GanzAfrica";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const ogImage = imagePath || "/images/og-default.jpg";
    return {
        title: {
            default: title,
            template: `%s | ${siteName}`,
        },
        description,
        openGraph: {
            type: "website",
            locale: params.locale,
            url: baseUrl,
            siteName,
            title,
            description,
            images: [
                {
                    url: `${baseUrl}${ogImage}`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
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
