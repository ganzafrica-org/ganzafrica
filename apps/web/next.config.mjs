import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Trace deps from the monorepo root so the standalone bundle includes workspace packages.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@workspace/ui"],

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "**.blob.core.windows.net" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com" },
      { protocol: "https", hostname: "**.ganzafrica.org" },
      { protocol: "https", hostname: "ganzafrica.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  compress: true,

  experimental: {
    optimizePackageImports: ["gsap", "lucide-react"],
  },
};

export default nextConfig;
