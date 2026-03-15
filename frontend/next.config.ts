import type { NextConfig } from 'next';

// Define the base Next.js configuration
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      fs: './src/lib/fhevm-sdk/internal/mock/browser-stubs.js',
      path: './src/lib/fhevm-sdk/internal/mock/browser-stubs.js',
    },
  },
};

export default nextConfig;
