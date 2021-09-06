module.exports = {
  extends: [
    '@josselinbuils/eslint-config-react',
    'plugin:@next/next/recommended',
  ],
  rules: {
    '@next/next/no-img-element': 'off',
    '@typescript-eslint/no-var-requires': 'off', // applied to js files
    'react/jsx-no-bind': 'off',
    'react/require-default-props': 'off',
  },
};
