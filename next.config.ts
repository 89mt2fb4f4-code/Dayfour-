import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site: every page is prebuilt HTML, so it can be hosted anywhere.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
