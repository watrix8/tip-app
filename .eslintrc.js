module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
    },
  }