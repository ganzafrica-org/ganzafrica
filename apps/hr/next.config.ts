import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Build runs from apps/hr, so the monorepo root is two levels up.
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.blob.core.windows.net" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com" },
      { protocol: "https", hostname: "**.ganzafrica.org" },
      { protocol: "https", hostname: "ganzafrica.org" },
    ],
  },
};

export default nextConfig;
