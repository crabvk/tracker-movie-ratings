const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.txt$|tablesorter\.js$/,
        exclude: /node_modules/,
        loader: 'raw-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      'manifest.json',
      'src/background.js',
      'src/styles.css',
      { from: 'images', to: 'images' }
    ])
  ],
  optimization: {
    minimizer: [new TerserPlugin()]
  }
}
