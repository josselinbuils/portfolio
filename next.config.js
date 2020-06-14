const { homepage } = require('./package.json');

const { pathname } = new URL(homepage);
const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? pathname : '';

let config = {
  assetPrefix: basePath,
  experimental: {
    basePath: basePath,
    productionBrowserSourceMaps: true,
  },
};

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  config = withBundleAnalyzer(config);
}

module.exports = config;
