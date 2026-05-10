// @ts-check

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
  js.configs.recommended,
  typescript.strict,
  perfectionist['recommended-natural'],
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  prettier,
  {
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
      '@typescript-eslint/no-var-requires': 'off', // applied to js files
      'default-param-last': 'off', // false positives
      'no-duplicate-imports': ['error', { includeExports: true }],
      'no-empty-function': 'off',
      'no-useless-constructor': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'react/function-component-definition': 'off',
      'react/jsx-no-bind': 'off',
      'react/no-unused-class-component-methods': 'off', // false positives
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
]);
