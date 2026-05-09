import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, max-age=0, must-revalidate',
        },
      ],
    },
  ],
};

export default nextConfig;
