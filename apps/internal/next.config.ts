import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/internal" : "",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "**.ganzafrica.org",
      },
      {
        protocol: "https",
        hostname: "ganzafrica.org",
      },
    ],
  },
};

export default nextConfig;
