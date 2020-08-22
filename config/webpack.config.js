const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const GetFilesPlugin = require('./webpack-get-files-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Get Entrypoints
const entryPath = path.resolve('public-dev/entry');
const entrypoints = [];
const files = fs.readdirSync(entryPath);
entrypoints.push(...files);

module.exports = (env) => {
  if (!env) {
    throw new Error('Please Provide --env option');
  }

  // mode
  let { mode } = env;
  if (!env.mode) {
    mode = 'production';
  }

  // entry
  const entry = {};
  entrypoints.forEach((file) => {
    const name = path.basename(file, '.js');
    entry[name] = path.join(entryPath, file);
  });

  //  Output
  const output = {
    path: path.join(__dirname, '../public'),
    filename: 'js/[name].[contentHash].js',
  };

  // plugins
  const plugins = [
    new CleanWebpackPlugin(),
    new GetFilesPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contentHash].css',
    }),
  ];

  // Module
  const module = {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'public-dev'),
      },

      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: {
          loader: 'file-loader',
          options: { name: 'images/[name].[contentHash].[ext]' },
        },
        exclude: /node_modules/,
      },
    ],
  };

  // Optimization
  const optimization = {
    runtimeChunk: 'single',
    moduleIds: 'hashed',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(currentModule) {
            const packageName = currentModule.context
              .match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
              .replace('@', '-');

            return `npm.${packageName}`;
          },
          chunks: 'all',
        },
      },
    },
  };

  const config = {
    mode,
    entry,
    output,
    optimization,
    plugins,
    module,
  };

  // Everything else that's needed in Development Mode
  // Devtool
  if (mode === 'development') {
    config.devtool = 'eval-cheap-module-source-map';
  }

  // Everything else that's needed in Production Mode
  // Minimizer
  if (mode === 'production') {
    config.optimization.minimizer = [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({}),
    ];
  }

  return config;
};
