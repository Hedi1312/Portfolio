import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
    proxyClientMaxBodySize: 150 * 1024 * 1024,
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/stats/script.js',
        destination: 'https://cloud.umami.is/script.js',
      },
      {
        source: '/stats/api/send',
        destination: 'https://cloud.umami.is/api/send',
      },
    ];
  },
};

export default nextConfig;
