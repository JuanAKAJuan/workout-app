// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  ignorePatterns: ['/dist/*'],
  rules: {
    'prettier/prettier': 'warn', // Show Prettier issues as warnings (or change to 'error')
  },
};
