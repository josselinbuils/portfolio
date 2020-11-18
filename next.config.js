// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')(['@josselinbuils/utils']);

let nextConfig = withTM({
  experimental: {
    productionBrowserSourceMaps: true,
  },
  images: {
    imageSizes: [202],
  },
  webpack: (webpackConfig) => {
    webpackConfig.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return webpackConfig;
  },
});

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line import/no-extraneous-dependencies,@typescript-eslint/no-var-requires,global-require
  const bundleAnalyzer = require('@next/bundle-analyzer');
  const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });
  nextConfig = withBundleAnalyzer(nextConfig);
}

module.exports = nextConfig;
