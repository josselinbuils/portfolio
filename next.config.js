const withTM = require('next-transpile-modules')([
  '@josselinbuils/hooks',
  '@josselinbuils/utils',
]);

let nextConfig = withTM({
  cleanDistDir: false,
  eslint: { ignoreDuringBuilds: true },
  images: { imageSizes: [202, 404] },
  productionBrowserSourceMaps: true,
});

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const withNextBundleAnalyzer = require('next-bundle-analyzer')();
  nextConfig = withNextBundleAnalyzer(nextConfig);
}

module.exports = nextConfig;
