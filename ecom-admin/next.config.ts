import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ecom-rest-topaz.vercel.app/:path*',
      },
    ];
  },
};

export default nextConfig;
