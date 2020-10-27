/* eslint-disable import/no-extraneous-dependencies */

const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const babelEnvDeps = require('webpack-babel-env-deps');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const getEntryPoints = require('./AssetHelpers/entries');
const loaders = require('./AssetHelpers/loaders');

module.exports = (() => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const areas = glob.sync(path.resolve(__dirname, 'Areas/*'));
  const output = path.resolve(__dirname, 'wwwroot/dist');
  const manifest = 'manifest.json';
  const publicPath = '/dist/';

  const nodeModulesRegex = /node_modules/;
  const lazyRegex = /\.lazy\./;
  const injectRegex = /inject/;
  const jsRegex = /\.js$/;
  const cssRegex = /\.css$/;
  const scssRegex = /\.scss$/;
  const fontRegex = /\.(otf|eot|ttf|woff|woff2)$/;
  const svgRegex = /\.svg$/;
  const imageRegex = /\.(jpg|jpeg|png|gif)$/;

  const entries = {};

  // Get entry points for Assets in root folder
  Object.assign(entries, getEntryPoints(__dirname));

  // Get entry points for Assets in area folders
  areas.forEach((area) => {
    Object.assign(entries, getEntryPoints(area, path.basename(area)));
  });

  // Add aliases for Assets in root folder
  const aliases = {
    '@': path.resolve(__dirname, 'Assets'),
  };

  // Add aliases for Assets in area folders
  areas.forEach((area) => {
    aliases[`@${path.basename(area)}`] = path.resolve(area, 'Assets');
  });

  const stats = {
    modules: false,
    children: false,
    colors: true,
  };

  if (isDevelopment) {
    stats.assets = false;
  }

  const filename = (ext) => {
    return isDevelopment
      ? `[name].${ext}`
      : `[name].min.${ext}?v=[contenthash]`;
  };

  const jsFilename = filename('js');
  const cssFilename = filename('css');

  const cssBaseModules = [loaders.cssLoader(1), loaders.postCssLoader];

  const cssModulesInjected = (lazy) => [
    loaders.styleLoader(lazy),
    ...cssBaseModules,
  ];

  const scssBaseNodeModules = [
    loaders.cssLoader(2),
    loaders.postCssLoader,
    loaders.sassLoader,
  ];

  const scssBaseModules = [
    loaders.cssLoader(3),
    loaders.postCssLoader,
    loaders.resolveUrlLoader,
    loaders.sassLoader,
  ];

  const scssModulesInjected = (lazy) => [
    loaders.styleLoader(lazy),
    ...scssBaseModules,
  ];

  const config = {
    stats,
    context: __dirname,
    entry: entries,
    resolve: {
      alias: {
        ...aliases,
      },
    },
    output: {
      publicPath,
      filename: jsFilename,
      chunkFilename: jsFilename,
      sourceMapFilename: '[file].map',
    },
    devtool: isDevelopment ? false : 'nosources-source-map',
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
          // Include source maps from node_modules
          test: jsRegex,
          include: nodeModulesRegex,
          use: {
            loader: 'source-map-loader',
          },
          enforce: 'pre',
        },
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
          test: jsRegex,
          oneOf: [
            {
              // Compile everything not in node_modules with babel-loader
              exclude: nodeModulesRegex,
              use: loaders.babelLoader,
            },
            {
              // Transpile all node_modules who are not browser friendly
              include: babelEnvDeps.include(),
              use: loaders.babelLoaderDeps,
            },
          ],
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
              use: [loaders.miniCssExtractPluginLoader, ...cssBaseModules],
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
                  use: [loaders.styleLoader(false), ...scssBaseNodeModules],
                },
                {
                  // Extract all other styling from node_modules into .css files
                  use: [
                    loaders.miniCssExtractPluginLoader,
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
              use: [loaders.miniCssExtractPluginLoader, ...scssBaseModules],
            },
          ],
        },
        {
          // Copies fonts to output
          test: fontRegex,
          use: loaders.urlLoader,
        },
        {
          // Copies svg's from node_modules to output and optimize
          test: svgRegex,
          include: nodeModulesRegex,
          use: [loaders.svgUrlLoader, loaders.imgLoader],
        },
        {
          // Copies svg's to output
          test: svgRegex,
          exclude: nodeModulesRegex,
          use: loaders.svgUrlLoader,
        },
        {
          // Copies images from node_modules to output and optimize
          test: imageRegex,
          include: nodeModulesRegex,
          use: [loaders.urlLoader, loaders.imgLoader],
        },
        {
          // Copies images to output
          test: imageRegex,
          exclude: nodeModulesRegex,
          use: loaders.urlLoader,
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
      stats,
      contentBase: false,
      disableHostCheck: true,
      port: process.env.PORT,
    };
    config.plugins.push(
      new webpack.SourceMapDevToolPlugin({
        test: /\.s?css(\?.+)?$/,
        columns: false,
      }),
      new webpack.EvalSourceMapDevToolPlugin({
        test: /\.js(\?.+)?$/,
      }),
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
