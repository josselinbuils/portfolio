module.exports = {
  extends: [
    '@josselinbuils/eslint-config-react',
    'plugin:@next/next/recommended',
  ],
  rules: {
    '@next/next/no-img-element': 'off',
    '@typescript-eslint/no-var-requires': 'off', // applied to js files
    'default-param-last': 'off', // false positives
    'react/function-component-definition': 'off',
    'react/jsx-no-bind': 'off',
    'react/no-unused-class-component-methods': 'off', // false positives
    'react/require-default-props': 'off',
  },
};
