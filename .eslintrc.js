module.exports = {
  extends: [
    '@josselinbuils/eslint-config-react',
    'plugin:@next/next/recommended'
  ],
  rules: {
    '@next/next/no-img-element': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-var-requires': 'off', // applied to js files
    'default-param-last': 'off', // false positives
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc', caseInsensitive: false },
        'newlines-between': 'never',
        warnOnUnassignedImports: true,
        groups: [
          'type',
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'object',
        ],
      },
    ],
    'no-useless-constructor': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-no-bind': 'off',
    'react/no-unused-class-component-methods': 'off', // false positives
    'react/require-default-props': 'off'
  }
};
