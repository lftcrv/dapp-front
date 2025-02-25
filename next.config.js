/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  images: {
    unoptimized: true, // Disable image optimization for small images
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
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 500000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    return config;
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@privy-io/react-auth',
      '@walletconnect/modal-ui',
      'framer-motion',
      'wagmi',
    ],
  },
  env: {
    NEXT_PUBLIC_ELIZA_API_URL: process.env.NEXT_PUBLIC_ELIZA_API_URL,
    NEXT_PUBLIC_BACKEND_RADICAL_URL: process.env.NEXT_PUBLIC_BACKEND_RADICAL_URL,
    NEXT_PUBLIC_ETH_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS,
    NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT: process.env.NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT,
    NEXT_PUBLIC_DEPLOYMENT_FEES: process.env.NEXT_PUBLIC_DEPLOYMENT_FEES,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  },
};

export default nextConfig;