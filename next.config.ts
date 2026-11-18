import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/donate",
        destination: "/give",
        permanent: false,
      },
      {
        source: "/newspaper",
        destination: "/newsletter",
        permanent: true,
      },
      {
        source: "/newspapers",
        destination: "/newsletter",
        permanent: true,
      },
      {
        source: "/broadcasts",
        destination: "/newsletter",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
