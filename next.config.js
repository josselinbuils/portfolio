let config = {
  experimental: {
    productionBrowserSourceMaps: true,
  },
};

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line import/no-extraneous-dependencies,@typescript-eslint/no-var-requires,global-require
  const bundleAnalyzer = require('@next/bundle-analyzer');
  const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });
  config = withBundleAnalyzer(config);
}

module.exports = config;
