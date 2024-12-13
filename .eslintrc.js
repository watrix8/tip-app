// .eslintrc.js
module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Wyłączamy tymczasowo sprawdzanie nieużywanych zmiennych
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off'
    }
  }