const { withContentlayer } = require("next-contentlayer2");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      }
    ],
  },
  serverExternalPackages: ["@prisma/client"],
  outputFileTracingRoot: process.cwd(),
  transpilePackages: ["@flowconsole/web"]
};

module.exports = withContentlayer(nextConfig);
