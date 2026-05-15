// @ts-check

import css from '@eslint/css';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { configs as perfectionist } from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import { configs as typescript } from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['build/**/*', 'dist/**/*']),
  {
    extends: [
      js.configs.recommended,
      typescript.strict,
      perfectionist['recommended-natural'],
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      prettier,
    ],
    files: ['**/*.js', '**/*.mjs', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        browser: true,
        module: true,
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-var-requires': 'off', // Applied to js files
      'default-param-last': 'off', // False positives
      'no-duplicate-imports': ['error', { includeExports: true }],
      'no-empty-function': 'off',
      'no-useless-constructor': 'off',
      'perfectionist/sort-union-types': 'off', // Put null before types
      'react-hooks/exhaustive-deps': 'error',
      'react/function-component-definition': 'off',
      'react/jsx-no-bind': 'off',
      'react/no-unused-class-component-methods': 'off', // False positives
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {},
      },
      react: {
        // See https://github.com/preactjs/eslint-config-preact/blob/master/index.js
        react: {
          pragma: 'h',
          version: '16.0',
        },
      },
    },
  },
  {
    extends: ['css/recommended'],
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
    rules: {
      'css/no-important': 'off',
      'css/no-invalid-properties': ['error', { allowUnknownVariables: true }],
      'css/use-baseline': [
        'error',
        {
          allowProperties: ['accent-color', 'resize', 'user-select'],
          allowPropertyValues: { 'background-attachment': ['fixed'] },
          available: 'newly',
        },
      ],
    },
  },
]);
