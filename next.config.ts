import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin folosește module Node.js native — nu trebuie bundluit de Turbopack
  serverExternalPackages: ["firebase-admin"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
