let config = {
  assetPrefix: process.env.HTTP_PREFIX || '',
  experimental: {
    basePath: process.env.HTTP_PREFIX || '',
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
