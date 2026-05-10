module.exports = {
  overrides: [
    {
      files: ['*.frag'],
      options: { parser: 'glsl-parser' },
    },
  ],
  plugins: ['prettier-plugin-glsl'],
  singleQuote: true,
};
