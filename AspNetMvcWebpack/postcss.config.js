module.exports = ctx => ({
  plugins: {
    'postcss-preset-env': {},
    autoprefixer: {},
    cssnano:
      ctx.env === 'development'
        ? false
        : {
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
              },
            ],
          },
    'postcss-reporter': {},
  },
});
