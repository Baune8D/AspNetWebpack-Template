/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const configBuilder = require('aspnet-webpack');

module.exports = (() => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const output = path.resolve(__dirname, 'wwwroot/dist');
  const manifest = 'manifest.json';
  const publicPath = '/dist/';

  const nodeModulesRegex = /node_modules/;
  const lazyRegex = /\.lazy\./;
  const injectRegex = /inject/;
  const jsRegex = /\.js$/;
  const cssRegex = /\.css$/;
  const scssRegex = /\.scss$/;
  const assetRegex = /\.(jpg|jpeg|png|gif|svg|otf|eot|ttf|woff|woff2)$/;

  const filename = (ext) => {
    return isDevelopment
      ? `[name].${ext}`
      : `[name].min.${ext}?v=[contenthash]`;
  };

  const jsFilename = filename('js');
  const cssFilename = filename('css');

  const styleLoader = (lazy) => {
    const loader = {
      loader: 'style-loader',
    };
    if (lazy) {
      loader.options = {
        injectType: 'lazyStyleTag',
      };
    }
    return loader;
  };

  const cssLoader = (importLoaders) => ({
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
  });

  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: isDevelopment,
    },
  };

  const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: {
      sourceMap: isDevelopment,
      removeCR: true,
    },
  };

  const sassLoader = {
    loader: 'sass-loader',
    options: {
      // eslint-disable-next-line global-require
      implementation: require('sass'),
      sourceMap: true,
    },
  };

  const cssBaseModules = [cssLoader(1), postCssLoader];

  const cssModulesInjected = (lazy) => [
    styleLoader(lazy),
    ...cssBaseModules,
  ];

  const scssBaseNodeModules = [
    cssLoader(2),
    postCssLoader,
    sassLoader,
  ];

  const scssBaseModules = [
    cssLoader(3),
    postCssLoader,
    resolveUrlLoader,
    sassLoader,
  ];

  const scssModulesInjected = (lazy) => [
    styleLoader(lazy),
    ...scssBaseModules,
  ];

  const config = {
    ...configBuilder({
      context: __dirname,
      assetsRoot: 'Assets',
    }),
    output: {
      publicPath,
      filename: jsFilename,
      chunkFilename: jsFilename,
      sourceMapFilename: '[file].map',
    },
    devtool: isDevelopment ? 'inline-source-map' : 'nosources-source-map',
    mode: process.env.NODE_ENV,
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          cache: isDevelopment,
          sourceMap: true,
        }),
        new OptimizeCssAssetsPlugin(),
      ],
      runtimeChunk: 'single',
      splitChunks: {
        minChunks: 1,
        cacheGroups: {
          vendors: {
            test: (module) => {
              // Include if any of the following are true.
              return (
                module.context.includes('node_modules') ||
                /[\\/]Assets[\\/]vendor/.test(module.context) ||
                /[\\/]Assets[\\/]styles[\\/]vendor/.test(module.context)
              );
            },
            chunks: 'initial',
            priority: 90,
            name: 'Vendors',
          },
          commons: {
            chunks: 'initial',
            priority: 80,
            reuseExistingChunk: true,
            name: 'Commons',
          },
        },
      },
    },
    module: {
      rules: [
        {
          // Expose jQuery to global scope
          test: require.resolve('jquery'),
          use: {
            loader: 'expose-loader',
            options: {
              exposes: {
                globalName: '$',
                override: true,
              },
            },
          },
        },
        {
          // Compile everything not in node_modules with babel-loader
          test: jsRegex,
          exclude: nodeModulesRegex,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: isDevelopment,
            },
          },
        },
        {
          test: cssRegex,
          oneOf: [
            {
              // Add support for lazy css files using <filename>.lazy.css
              test: lazyRegex,
              use: cssModulesInjected(true),
            },
            {
              // Add support for injecting css files with js using <filename>.css?inject
              resourceQuery: injectRegex,
              use: cssModulesInjected(false),
            },
            {
              // Extract all other styling into .css files
              use: [MiniCssExtractPlugin.loader, ...cssBaseModules],
            },
          ],
        },
        {
          test: scssRegex,
          oneOf: [
            {
              include: nodeModulesRegex,
              oneOf: [
                {
                  // Add support for injecting scss files from node_modules with js using <filename>.scss?inject
                  resourceQuery: injectRegex,
                  use: [styleLoader(false), ...scssBaseNodeModules],
                },
                {
                  // Extract all other styling from node_modules into .css files
                  use: [
                    MiniCssExtractPlugin.loader,
                    ...scssBaseNodeModules,
                  ],
                },
              ],
            },
            {
              // Add support for lazy scss files using <filename>.lazy.scss
              test: lazyRegex,
              use: scssModulesInjected(true),
            },
            {
              // Add support for injecting scss files with js using <filename>.scss?inject
              resourceQuery: injectRegex,
              use: scssModulesInjected(false),
            },
            {
              // Extract all other styling into .css files
              use: [MiniCssExtractPlugin.loader, ...scssBaseModules],
            },
          ],
        },
        {
          // Copies images to output
          test: assetRegex,
          use: {
            loader: 'url-loader',
            options: {
              limit: 2048,
              name: (file) => {
                if (file.includes('node_modules')) {
                  return 'vendor/[name].[ext]';
                }
                return '[path][name].[ext]';
              },
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
      }),
      new MiniCssExtractPlugin({
        filename: cssFilename,
        chunkFilename: cssFilename,
      }),
      new WebpackAssetsManifest({
        output: isDevelopment ? manifest : path.resolve(output, manifest),
        customize: (entry) => {
          const { key } = entry;
          if (key === 'runtime.js') {
            return entry;
          }
          const lowerKey = key.toLowerCase();
          if (!lowerKey.endsWith('.css') && !lowerKey.endsWith('.js')) {
            return false;
          }
          return entry;
        },
      }),
    ],
  };

  if (isDevelopment) {
    config.devServer = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      publicPath,
      contentBase: false,
      disableHostCheck: true,
      port: process.env.PORT,
    };
    config.plugins.push(
      new WebpackNotifierPlugin(),
    );
  } else {
    config.output.path = output;
    config.plugins.push(new CleanWebpackPlugin());
  }

  if (process.env.ANALYZE === 'true') {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
})();
