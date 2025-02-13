/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PORT: '3000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/profile-pictures/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_ELIZA_API_URL?.replace(/^https?:\/\//, '') || 'api.eliza.xyz',
        pathname: '/uploads/profile-pictures/**',
      },
    ],
  },
};

module.exports = nextConfig;
