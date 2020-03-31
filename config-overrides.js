const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const path = require('path');

module.exports = (config) => {
  config.resolve = {
    ...config.resolve,
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  };

  if (process.env.ANALYZE) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};
