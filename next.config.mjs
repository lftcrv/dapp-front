/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@radix-ui/themes"],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json'
    })

    return config
  }
}

export default nextConfig
