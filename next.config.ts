import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.APP_BUILD_DIR || ".next",
  reactStrictMode: true,
  agentRules: false,
  async headers() {
    return [
      {
        source: "/:locale/portfolio/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
  images: {
    deviceSizes: [
      640, 750, 828, 1080, 1200, 1440, 1672, 1920, 2048, 2560, 3200, 3840,
    ],
    qualities: [75, 100],
  },
};
export default config;
