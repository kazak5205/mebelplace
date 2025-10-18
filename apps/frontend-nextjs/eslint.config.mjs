import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Disable console warnings in development
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      // Allow any types for now (will be improved gradually)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Disable unused vars warnings for development
      '@typescript-eslint/no-unused-vars': 'warn',
      // Allow empty functions for placeholders
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '__mocks__/**',
      'src/__tests__/**',
      'cypress/**',
      'jest.config.js',
      'jest.*.config.js',
    ],
  },
];

export default eslintConfig;