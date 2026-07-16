import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Use the env variable, but fall back to a hardcoded string to prevent 500 errors
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://web.ganzafrica.org").replace(
    /\/$/,
    "",
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/private", "/search", "/_next", "/404", "/500"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/api", "/private"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
