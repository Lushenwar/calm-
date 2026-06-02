import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.anilist.co",
      },
      {
        protocol: "https",
        hostname: "cdn.anilist.co",
      },
      {
        protocol: "https",
        hostname: "img.anili.st",
      },
    ],
  },
};

export default nextConfig;
