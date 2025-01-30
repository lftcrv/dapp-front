/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  env: {
    PORT: '3000'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // ... rest of existing config
}

module.exports = nextConfig 