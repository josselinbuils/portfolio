const path = require('path');

module.exports = config => {
  config.resolve = {
    ...config.resolve,
    alias: {
      '~': path.resolve(__dirname, 'src')
    },
    extensions: [
      '.sass',
      '.scss',
      '.css',
      '.wasm',
      '.web.js',
      '.mjs',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx'
    ]
  };
  return config;
};
