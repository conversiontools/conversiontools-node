import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  // For .js files (Node/ESM with require allowed)
  {
    files: ['index.js', '{lib,examples}/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Your JS rules (no TS extras)
      'indent': ['error', 2, { VariableDeclarator: 1, SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-console': 'off',
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
  },
  // For .ts files (TypeScript)
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'indent': ['error', 2, { VariableDeclarator: 1, SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-console': 'off',
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.test.ts'],
  },
];