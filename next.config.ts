import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: 'security',
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
