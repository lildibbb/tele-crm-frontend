import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",             // pure static build → out/
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,          // required for static export
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@phosphor-icons/react'],
  },
  // No rewrites() — apiClient.ts uses NEXT_PUBLIC_API_URL directly.
  // Local dev: set NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 in .env.local
};

export default nextConfig;
