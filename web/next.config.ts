import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const pagesBasePath = isStaticExport
  ? (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "")
  : "";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  trailingSlash: isStaticExport,
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: pagesBasePath,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
