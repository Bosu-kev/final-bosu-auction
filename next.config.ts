import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tools.finalbosu.com',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
