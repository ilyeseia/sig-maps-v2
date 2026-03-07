/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Use standalone output for Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Proxy backend API requests through Next.js
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3005/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;