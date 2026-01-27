const { withContentlayer } = require("next-contentlayer2");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  serverExternalPackages: [
    "@prisma/client",
    "@ast-grep/napi",
    "@ast-grep/lang-csharp",
    "@ast-grep/lang-go",
    "@ast-grep/lang-java",
    "@ast-grep/lang-python",
  ],
  outputFileTracingRoot: process.cwd(),
  transpilePackages: ["@flowconsole/web"],
  webpack: (config) => {
    config.module.rules.push({
      resourceQuery: /raw/,
      type: "asset/source",
    });
    return config;
  },
};

module.exports = withContentlayer(nextConfig);
