const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const NODE_ENV = (process.env.NODE_ENV && process.env.NODE_ENV.trim()) || 'development'
const examples = require('./examples.json')

let config = {
  entry: {
    // Common chunks
    'react': ['react', 'react-dom', 'prop-types'],
    'react-navtree': ['react-navtree']
  },

  output: {
    path: path.join(__dirname, '/../dist/examples'),
    filename: '[name]/bundle.js'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    }),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['react-navtree', 'react'],
      minChunks: Infinity
    })
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.css'],

    alias: {
      'react-navtree': path.join(__dirname, '../src/')
    }
  },

  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: '/node_modules/' },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
}

//
// Build index page
//
config.entry['index'] = path.join(__dirname, 'index.js')
config.plugins.push(
  new HtmlWebpackPlugin({
    template: path.join(__dirname, 'utils', 'tpl.html'),
    filename: 'index.html',
    chunks: ['index', 'react', 'react-navtree']
  })
)

//
// Build examples
//
Object.keys(examples).forEach((exampleName) => {
  // Entry for each example
  config.entry[exampleName] = path.join(__dirname, exampleName, 'index.js')

  // Generate separate HTML page for each example
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'utils', 'tpl.html'),
      filename: path.join(exampleName, 'index.html'),
      chunks: [exampleName, 'react', 'react-navtree']
    })
  )
})

if (NODE_ENV === 'production') {
  config.plugins.push(new UglifyJSPlugin())
}

module.exports = config
