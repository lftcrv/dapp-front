/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json'
    })

    // Only run CSS extraction in production and on the client
    if (!isServer && process.env.NODE_ENV === 'production') {
      const MiniCssExtractPlugin = require('mini-css-extract-plugin')
      config.plugins.push(new MiniCssExtractPlugin())
    }

    return config
  }
}

export default nextConfig
