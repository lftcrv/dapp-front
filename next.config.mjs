/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable image optimization for small images
  },
  webpack: (config, { dev }) => {
    // Production optimizations
    if (!dev) {
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 500000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for third-party modules
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            enforce: true,
          },
          // Common chunk for shared code
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
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
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      "@privy-io/react-auth",
      "@walletconnect/modal-ui",
      "framer-motion",
      "wagmi",
    ],
  },
};

export default nextConfig;
