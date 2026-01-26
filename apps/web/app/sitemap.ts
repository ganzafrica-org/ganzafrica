import { MetadataRoute } from "next";

// Define the site URL
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web.ganzafrica.org";

// Define all static routes
const routes = [
    "",
    "/about",
    "/what-we-do",
    "/programs",
    "/projects",
    "/newsroom",
    "/contact",
    "/faqs",
];

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: (route === "" ? "monthly" : "weekly") as "monthly" | "weekly",
        priority: route === "" ? 1.0 : 0.8,
    }));

    // If you later add dynamic paths (like individual news articles),
    // you can spread them into the return array here.
    return [...staticRoutes];
}