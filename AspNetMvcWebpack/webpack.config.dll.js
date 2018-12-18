const path = require('path');
const webpack = require('webpack');
const babelEnvDeps = require('webpack-babel-env-deps');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = (() => {
  const isDev = process.env.NODE_ENV === 'development';
  const output = isDev
    ? path.resolve('./.vendor-dll/dist')
    : path.resolve('./wwwroot/dist');

  const stats = {
    children: false,
    colors: true,
  };

  const cssLoader = importLoaders => ({
    loader: 'css-loader',
    options: {
      importLoaders,
      sourceMap: isDev,
      localIdentName: isDev
        ? '[name]__[local]--[hash:base64:5]'
        : '[hash:base64]',
    },
  });

  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: isDev,
      config: {
        path: path.resolve('.'),
      },
    },
  };

  const sassLoader = {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
    },
  };

  const imgLoader = {
    loader: 'img-loader',
    options: {
      plugins: !isDev && [
        /* eslint-disable global-require */
        require('imagemin-gifsicle')({}),
        require('imagemin-mozjpeg')({}),
        require('imagemin-optipng')({}),
        require('imagemin-svgo')({}),
        /* eslint-enable global-require */
      ],
    },
  };

  const urlLoadersLimit = 8192;

  const fileLoaderNameOptions = file => {
    if (file.includes('node_modules')) {
      return 'vendor/[name].[ext]';
    }
    return '[path][name].[ext]';
  };

  const urlLoader = {
    loader: 'url-loader',
    options: {
      limit: urlLoadersLimit,
      name: fileLoaderNameOptions,
    },
  };

  const config = {
    stats,
    context: path.resolve('./Assets'),
    entry: {
      VendorDll: [path.resolve('./Assets/vendor.dll.js')],
    },
    output: {
      path: output,
      publicPath: isDev ? 'http://localhost:9000/dist/' : '/dist/',
      filename: isDev ? '[name].js' : '[name].min.js?v=[contenthash]',
      chunkFilename: isDev
        ? '[name].chunk.js'
        : '[name].chunk.min.js?v=[contenthash]',
    },
    mode: process.env.NODE_ENV,
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'source-map-loader',
          enforce: 'pre',
        },
        {
          test: /\.js$/,
          include: [babelEnvDeps.include()],
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            cssLoader(1, false),
            postCssLoader,
          ],
        },
        {
          test: /\.scss$/,
          include: path.resolve('./node_modules'),
          use: [
            MiniCssExtractPlugin.loader,
            cssLoader(2, false),
            postCssLoader,
            sassLoader,
          ],
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-url-loader',
              options: {
                limit: urlLoadersLimit,
                stripdeclarations: true,
                iesafe: true,
                name: fileLoaderNameOptions,
              },
            },
            imgLoader,
          ],
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/,
          use: [urlLoader, imgLoader],
        },
        {
          test: /\.(otf|eot|ttf|woff|woff2)$/,
          use: urlLoader,
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
      }),
      new MiniCssExtractPlugin({
        filename: isDev ? '[name].css' : '[name].min.css?v=[contenthash]',
        chunkFilename: isDev
          ? '[name].chunk.css'
          : '[name].chunk.min.css?v=[contenthash]',
      }),
      new WebpackAssetsManifest({
        merge: true,
        output: path.resolve(output, 'manifest.json'),
        customize: entry => {
          const { key } = entry;
          const lowerKey = key.toLowerCase();
          if (!lowerKey.endsWith('.css') && !lowerKey.endsWith('.js')) {
            return false;
          }
          return {
            key,
            value: entry.value,
          };
        },
      }),
      new webpack.DllPlugin({
        name: '[name]',
        path: path.resolve(output, 'dll-manifest.json'),
      }),
    ],
  };

  if (isDev) {
    config.devtool = 'cheap-module-source-map';
  } else {
    config.plugins.unshift(new CleanWebpackPlugin([output]));
  }

  return config;
})();
