/* eslint-disable import/no-extraneous-dependencies */

module.exports = () => ({
  /* eslint-disable global-require */
  plugins: [require('postcss-preset-env')(), require('postcss-reporter')()],
  /* eslint-enable global-require */
});
