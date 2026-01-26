import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    // Use the env variable, but fall back to a hardcoded string to prevent 500 errors
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
        : "https://ganzafrica.org";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/api", "/private", "/search"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}