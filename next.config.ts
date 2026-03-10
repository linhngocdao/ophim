import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.ophim.live',
        pathname: '/uploads/movies/**',
      },
      {
        protocol: 'https',
        hostname: 'ophim1.com',
      },
      {
        protocol: 'https',
        hostname: '*.ophim.live',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://ophim1.com/:path*',
      },
    ]
  },
};

export default nextConfig;
