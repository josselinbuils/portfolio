const path = require('path');

module.exports = (config) => {
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
