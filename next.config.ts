import type { NextConfig } from "next";
const config: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1672, 1920, 2048, 2560, 3200, 3840],
    qualities: [75, 100],
  },
};
export default config;
