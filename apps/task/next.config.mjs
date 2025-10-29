/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  // Enable TypeScript and ESLint checking in production
  typescript: { 
    ignoreBuildErrors: false, // Enable strict checking
  },
  eslint: { 
    ignoreDuringBuilds: false, // Enable linting
  }
}

export default nextConfig


