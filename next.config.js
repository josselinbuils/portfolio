// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')([
  '@josselinbuils/hooks',
  '@josselinbuils/utils',
]);

let nextConfig = withTM({
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    imageSizes: [202],
  },
  productionBrowserSourceMaps: true,
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /parser-((?!babel).)+/,
        contextRegExp: /prettier$/,
      })
    );
    return config;
  },
});

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line import/no-extraneous-dependencies,@typescript-eslint/no-var-requires,global-require
  const withNextBundleAnalyzer = require('next-bundle-analyzer')();
  nextConfig = withNextBundleAnalyzer(nextConfig);
}

module.exports = nextConfig;
