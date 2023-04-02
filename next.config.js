let nextConfig = {
  cleanDistDir: false,
  eslint: { ignoreDuringBuilds: true },
  images: { imageSizes: [202, 404] },
  productionBrowserSourceMaps: true,
  transpilePackages: ['@josselinbuils/hooks', '@josselinbuils/utils'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(frag|vert)$/,
      type: 'asset/source',
    });
    return config;
  },
};

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const withNextBundleAnalyzer = require('next-bundle-analyzer')();
  nextConfig = withNextBundleAnalyzer(nextConfig);
}

module.exports = nextConfig;
