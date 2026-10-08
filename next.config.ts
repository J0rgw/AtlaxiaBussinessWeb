import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// v2 lives inside the legacy repo, which has its own package-lock.json.
// Pin the project root so Next does not infer the parent folder as workspace root.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Empty for root or custom-domain hosting; "/<repo>" for GitHub Pages project sites.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  experimental: {
    // One root layout per locale means there is no shared layout for the 404,
    // so it is defined once in app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
