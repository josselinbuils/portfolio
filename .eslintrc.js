module.exports = {
  extends: [
    '@josselinbuils/eslint-config-react',
  ],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-var-requires': 'off', // applied to js files
    'default-param-last': 'off', // false positives
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc', caseInsensitive: false },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'object',
        ],
        'newlines-between': 'never',
        "pathGroups": [
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        warnOnUnassignedImports: true,
      },
    ],
    'no-useless-constructor': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-no-bind': 'off',
    'react/no-unused-class-component-methods': 'off', // false positives
    'react/require-default-props': 'off'
  }
};
