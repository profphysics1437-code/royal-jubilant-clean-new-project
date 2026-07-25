import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Force webpack instead of Turbopack for stability on shared hosting
  experimental: {
    turbopack: false,
  },
};

export default nextConfig;
