/** @type {import('next').NextConfig} */
const nextConfig = {
  // Match portal behavior: mount the app at /task in production
  basePath: process.env.NODE_ENV === 'production' ? '/task' : '',
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
  // Keep strict checks enabled
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig


