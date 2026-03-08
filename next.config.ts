import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@phosphor-icons/react",
    ],
  },
};

export default nextConfig;
