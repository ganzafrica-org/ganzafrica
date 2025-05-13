/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    domains: ['web.ganzafrica.org', 'ganzafrica.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'web.ganzafrica.org',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'ganzafrica.org',
        pathname: '/wp-content/**',
      },
    ],
  },
};

export default nextConfig;
