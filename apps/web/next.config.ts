import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Webpack from bundling pdf-parse — it reads a test file on load
  // which fails at build time. Treating it as external resolves the issue.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
