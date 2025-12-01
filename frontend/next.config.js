const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Polyfills for Node.js modules not available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Server-side: externalize FHE SDK to prevent SSR issues
    if (isServer) {
      config.externals.push('@zama-fhe/relayer-sdk/web');
    }
    
    // Client-side: inject global polyfill for browser compatibility
    // @zama-fhe/relayer-sdk expects Node.js 'global'
    if (!isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          global: 'globalThis',
        })
      );
    }
    
    // Ignore optional dependencies we don't need
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };

    config.externals.push("pino-pretty", "encoding");

    return config;
  },
};

module.exports = nextConfig;
