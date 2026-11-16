import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Hostinger Business plans can have tight build-worker limits. Keep static
  // generation concurrency conservative to avoid worker-thread exhaustion.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Serve a Markdown representation of the homepage when an agent explicitly
  // sends Accept: text/markdown; ordinary browser requests remain HTML.
  async rewrites() {
    return [
      {
        source: "/",
        has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
        destination: "/home.md",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/.well-known/ai-catalog.json",
        headers: [{ key: "Content-Type", value: "application/ai-catalog+json; charset=utf-8" }],
      },
      {
        source: "/.well-known/mcp/server-card.json",
        headers: [{ key: "Content-Type", value: "application/mcp-server-card+json; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
