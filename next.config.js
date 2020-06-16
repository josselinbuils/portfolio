const CircularDependencyPlugin = require('circular-dependency-plugin');

let config = {
  experimental: {
    productionBrowserSourceMaps: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new CircularDependencyPlugin({
        allowAsyncCycles: false,
        exclude: /node_modules/,
        failOnError: true,
        cwd: process.cwd(),
      })
    );
    return config;
  },
};

if (process.env.ANALYZE === 'true') {
  const bundleAnalyzer = require('@next/bundle-analyzer');
  const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });
  config = withBundleAnalyzer(config);
}

module.exports = config;
