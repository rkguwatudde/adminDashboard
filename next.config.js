/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  // Webpack configuration to handle console logs in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // In production client-side builds, ensure NODE_ENV is properly set
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        })
      )
    }
    return config
  },
}

module.exports = nextConfig
