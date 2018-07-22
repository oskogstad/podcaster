module.exports = {
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
        jsx: true,
    }
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        tabWidth: 4,
        tabs: true,
        trailingComma: 'all',
      },
    ],
    eqeqeq: ['error', 'always'],
  },
};