/* eslint-disable import/no-extraneous-dependencies */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';
const urlLoadersLimit = 2048;

const fileLoaderNameOption = (file) => {
  if (file.includes('node_modules')) {
    return 'vendor/[name].[ext]';
  }
  return '[path][name].[ext]';
};

module.exports = {
  styleLoader: (lazy) => {
    const loader = {
      loader: 'style-loader',
    };
    if (lazy) {
      loader.options = {
        injectType: 'lazyStyleTag',
      };
    }
    return loader;
  },

  cssLoader: (importLoaders) => ({
    loader: 'css-loader',
    options: {
      sourceMap: isDevelopment,
      modules: {
        auto: true,
        localIdentName: isDevelopment
          ? '[name]__[local]--[hash:base64:5]'
          : '[hash:base64]',
      },
      importLoaders,
    },
  }),

  postCssLoader: {
    loader: 'postcss-loader',
    options: {
      sourceMap: isDevelopment,
    },
  },

  resolveUrlLoader: {
    loader: 'resolve-url-loader',
    options: {
      sourceMap: isDevelopment,
      removeCR: true,
    },
  },

  sassLoader: {
    loader: 'sass-loader',
    options: {
      // eslint-disable-next-line global-require
      implementation: require('sass'),
      sourceMap: true,
    },
  },

  miniCssExtractPluginLoader: {
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: isDevelopment,
    },
  },

  svgUrlLoader: {
    loader: 'svg-url-loader',
    options: {
      limit: urlLoadersLimit,
      iesafe: true,
      name: fileLoaderNameOption,
    },
  },

  urlLoader: {
    loader: 'url-loader',
    options: {
      limit: urlLoadersLimit,
      name: fileLoaderNameOption,
    },
  },

  fileLoader: {
    loader: 'file-loader',
    options: {
      name: fileLoaderNameOption,
    },
  },

  imgLoader: {
    loader: 'img-loader',
    options: {
      plugins: !isDevelopment && [
        /* eslint-disable global-require */
        require('imagemin-gifsicle')({}),
        require('imagemin-mozjpeg')({}),
        require('imagemin-optipng')({}),
        require('imagemin-svgo')({}),
        /* eslint-enable global-require */
      ],
    },
  },

  babelLoader: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: isDevelopment,
    },
  },

  babelLoaderDeps: {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
      ],
      cacheDirectory: isDevelopment,
    },
  },
};
