/** @type {import('next').NextConfig} */
const nextConfig = {
  // Match portal behavior: mount the app at /task in production
  basePath: process.env.NODE_ENV === "production" ? "/task" : "",
  transpilePackages: ["@workspace/ui"],
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Allow localhost for development
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // Keep strict checks enabled
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
