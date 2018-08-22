const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = (() => {
  const isDev = process.env.NODE_ENV === 'development';
  const assets = path.resolve('./Assets');
  const output = path.resolve('./wwwroot/dist');
  const nodeModules = path.resolve('./node_modules');
  const publicPath = isDev ? 'http://localhost:9000/dist/' : '/dist/';

  const stats = {
    children: false,
    colors: true,
  };

  const cssLoader = (importLoaders, modules) => ({
    loader: 'css-loader',
    options: {
      modules,
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

  const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: {
      sourceMap: isDev,
      root: assets,
    },
  };

  const sassLoader = {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
    },
  };

  const config = {
    stats,
    context: assets,
    entry: (() => {
      const entries = {};

      // Get all Assets/bundles
      const bundleGlob = path.resolve('./Assets/bundles', '*.js');
      const bundles = glob.sync(bundleGlob);
      Object.values(bundles).forEach(bundle => {
        const ext = path.extname(bundle);
        const name = path.basename(bundle, ext);
        entries[name] = bundle;
      });

      // Get all Assets/views (excluding partials)
      const viewGlob = path.resolve('./Assets/views', '*/*/@(I|i)ndex.js');
      const views = glob.sync(viewGlob, {
        ignore: ['**/_*', '**/_*/**'],
      });
      Object.values(views).forEach(view => {
        const filePath = path.dirname(view);
        const splitPath = filePath.split('/');
        const pathCount = splitPath.length;
        const name = `${splitPath[pathCount - 2]}_${splitPath[pathCount - 1]}`;
        entries[name] = view;
      });

      return entries;
    })(),
    resolve: {
      alias: {
        Bundles: path.resolve(assets, 'bundles'),
        Components: path.resolve(assets, 'components'),
        Images: path.resolve(assets, 'images'),
        Json: path.resolve(assets, 'json'),
        Modules: path.resolve(assets, 'modules'),
        Scripts: path.resolve(assets, 'scripts'),
        Styles: path.resolve(assets, 'styles'),
        Vendor: path.resolve(assets, 'vendor'),
        Views: path.resolve(assets, 'views'),
      },
    },
    output: {
      path: output,
      publicPath,
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
          exclude: nodeModules,
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
          include: nodeModules,
          use: [
            MiniCssExtractPlugin.loader,
            cssLoader(2, false),
            postCssLoader,
            sassLoader,
          ],
        },
        {
          test: /\.scss$/,
          exclude: [nodeModules, /\.module\.scss$/],
          use: [
            MiniCssExtractPlugin.loader,
            cssLoader(3, false),
            postCssLoader,
            resolveUrlLoader,
            sassLoader,
          ],
        },
        {
          test: /\.module\.scss$/,
          exclude: nodeModules,
          use: [
            MiniCssExtractPlugin.loader,
            cssLoader(3, true),
            postCssLoader,
            resolveUrlLoader,
            sassLoader,
          ],
        },
        {
          test: /\.(otf|eot|ttf|woff|woff2|svg|jpg|jpeg|png|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: file => {
                let filename;
                if (file.includes('node_modules')) {
                  filename = 'vendor/[name].[ext]';
                } else {
                  filename = '[path][name].[ext]';
                }
                if (!isDev) {
                  filename += '?v=[hash]';
                }
                return filename;
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
    ],
  };

  if (isDev) {
    config.serve = {
      devMiddleware: {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        publicPath,
        stats,
      },
      port: 9000,
      clipboard: false,
    };
    config.devtool = 'cheap-module-source-map';
  } else {
    config.optimization = {
      minimizer: [
        new UglifyJsPlugin({
          parallel: true,
          sourceMap: true,
          uglifyOptions: {
            output: {
              comments: false,
            },
          },
        }),
      ],
    };
    config.plugins.unshift(new CleanWebpackPlugin([output]));
  }
  return config;
})();
