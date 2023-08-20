module.exports = {
  plugins: ['prettier-plugin-glsl'],
  overrides: [
    {
      files: ['*.frag'],
      options: { parser: 'glsl-parser' },
    },
  ],
  singleQuote: true,
};
