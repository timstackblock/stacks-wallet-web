/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const { version: _version } = require('../package.json');
const generateManifest = require('../scripts/generate-manifest');

const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const SRC_ROOT_PATH = path.join(__dirname, '../', 'src');
const DIST_ROOT_PATH = path.join(__dirname, '../', 'dist');
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';
const IS_PROD = !IS_DEV;
const TEST_ENV = !!process.env.TEST_ENV;
const ANALYZE_BUNDLE = process.env.ANALYZE === 'true';
const IS_PUBLISHING = !!process.env.IS_PUBLISHING;
const MAIN_BRANCH = 'refs/heads/main';
const GITHUB_REF = process.env.GITHUB_REF;
const GITHUB_SHA = process.env.GITHUB_SHA;

/**
 * For non main branch builds, we add a random number after the patch version.
 */
const getVersionWithRandomSuffix = ref => {
  if (ref === MAIN_BRANCH || !ref || IS_PUBLISHING) return _version;
  return `${_version}.${Math.floor(Math.floor(Math.random() * 1000))}`;
};

const BRANCH = GITHUB_REF;
const COMMIT_SHA = GITHUB_SHA;
const VERSION = getVersionWithRandomSuffix(BRANCH);

// to measure speed :~)
const smp = new SpeedMeasurePlugin({
  disable: !ANALYZE_BUNDLE,
  granularLoaderData: true,
});

const APP_TITLE = 'Hiro Wallet';

const HTML_OPTIONS = {
  inject: 'body',
  title: APP_TITLE,
  chunks: ['index', 'common'],
};

const HTML_PROD_OPTIONS = IS_DEV
  ? HTML_OPTIONS
  : {
      ...HTML_OPTIONS,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    };

const aliases = {
  // alias stacks.js packages to their esm (default prefers /dist/polyfill)
  '@stacks/auth': '@stacks/auth/dist/esm',
  '@stacks/common': '@stacks/common/dist/esm',
  '@stacks/encryption': '@stacks/encryption/dist/esm',
  '@stacks/network': '@stacks/network/dist/esm',
  '@stacks/profile': '@stacks/profile/dist/esm',
  '@stacks/storage': '@stacks/storage/dist/esm',
  '@stacks/transactions': '@stacks/transactions/dist/esm',
  '@stacks/wallet-sdk': '@stacks/wallet-sdk/dist/esm',
  '@stacks/network/dist/polyfill': '@stacks/network/dist/esm',
};

const config = {
  entry: {
    background: path.join(SRC_ROOT_PATH, 'background', 'background.ts'),
    inpage: path.join(SRC_ROOT_PATH, 'inpage', 'inpage.ts'),
    'content-script': path.join(SRC_ROOT_PATH, 'content-scripts', 'content-script.ts'),
    index: path.join(SRC_ROOT_PATH, 'app', 'index.tsx'),
    'decryption-worker': path.join(SRC_ROOT_PATH, 'shared/workers/decryption-worker.ts'),
  },
  output: {
    path: DIST_ROOT_PATH,
    chunkFilename: !IS_DEV ? '[name].[contenthash:8].chunk.js' : IS_DEV && '[name].chunk.js',
    filename: () => '[name].js',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.d.ts'],
    plugins: [new TsconfigPathsPlugin()],
    alias: aliases,
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      assert: require.resolve('assert'),
      fs: false,
      path: false,
    },
  },
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
      name: 'common',
    },
    runtimeChunk: false,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx',
              target: 'esnext',
            },
          },
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.wasm$/,
        // Tells WebPack that this module should be included as
        // base64-encoded binary file and not as code
        loader: 'base64-loader',
        // Disables WebPack's opinion where WebAssembly should be,
        // makes it think that it's not WebAssembly
        //
        // Error: WebAssembly module is included in initial chunk.
        type: 'javascript/auto',
      },
    ].filter(Boolean),
  },
  watch: false,
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/wordlists\/(?!english)/,
      contextRegExp: /bip39\/src$/,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, '../', 'public', 'html', 'index.html'),
      filename: 'index.html',
      ...HTML_PROD_OPTIONS,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, '../', 'public', 'html', 'popup.html'),
      filename: 'popup.html',
      ...HTML_PROD_OPTIONS,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, '../', 'public', 'html', 'popup-center.html'),
      filename: 'popup-center.html',
      ...HTML_PROD_OPTIONS,
    }),
    new GenerateJsonPlugin(
      'manifest.json',
      generateManifest(VERSION),
      undefined,
      2 // space tabs
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(SRC_ROOT_PATH, '../', 'public', 'assets'),
          to: path.join(DIST_ROOT_PATH, 'assets'),
        },
        { from: 'node_modules/argon2-browser/dist/argon2.wasm', to: '.' },
      ],
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(NODE_ENV),
      VERSION: JSON.stringify(VERSION),
      COMMIT_SHA: JSON.stringify(COMMIT_SHA),
      BRANCH: JSON.stringify(BRANCH),
      'process.env.TEST_ENV': JSON.stringify(TEST_ENV ? 'true' : 'false'),
    }),

    new webpack.EnvironmentPlugin({
      SENTRY_DSN: process.env.SENTRY_DSN ?? '',
      SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY ?? '',
      WALLET_ENVIRONMENT: process.env.WALLET_ENVIRONMENT ?? 'development',
    }),

    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
      fetch: 'cross-fetch',
    }),

    new ProgressBarPlugin(),
  ],
};

module.exports = smp.wrap(config);

if (IS_PROD) {
  module.exports.plugins.push(
    new CleanWebpackPlugin({ verbose: true, dry: false, cleanStaleWebpackAssets: false })
  );
}
if (ANALYZE_BUNDLE) {
  module.exports.plugins.push(new BundleAnalyzerPlugin());
}
