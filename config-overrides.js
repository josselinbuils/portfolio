const CircularDependencyPlugin = require('circular-dependency-plugin');
const path = require('path');

module.exports = (config) => {
  config.plugins.push(
    new CircularDependencyPlugin({
      allowAsyncCycles: false,
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    })
  );
  config.resolve = {
    ...config.resolve,
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  };

  if (process.env.ANALYZE) {
    // Needs to be there to avoid the CI build to crash
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};
