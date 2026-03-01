import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import eslintComments from 'eslint-plugin-eslint-comments';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  prettier,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  {
    plugins: {
      'eslint-comments': eslintComments,
    },
    rules: {
      'eslint-comments/no-use': 'error', // Installer : npm install --save-dev eslint-plugin-eslint-comments et npm install --save-dev eslint-config-prettier
      //'no-console': 'error',
      //'no-alert': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
]);

export default eslintConfig;
