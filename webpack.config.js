const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  output: {},
  entry: {},
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(path.resolve(__dirname, 'node_modules'), 'odometer', 'odometer.min.js'),
          to: path.join(path.resolve(__dirname, 'js'), 'odometer.min.js')
        },
        {
          from: path.join(path.resolve(__dirname, 'node_modules'), 'odometer', 'themes', 'odometer-theme-default.css'),
          to: path.join(path.resolve(__dirname, 'css'), 'odometer-theme-default.css')
        }
      ]
    })
  ]
}; 
