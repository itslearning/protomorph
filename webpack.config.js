const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * This will extract the styles from the bundle.js file.
 */
const extractSass = new ExtractTextPlugin({filename: '[name].bundle.css'});

module.exports = {
    resolve: {
        extensions: ['.js', '.svelte', '.scss']
    },

    entry: {},

    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].bundle.js'
    },

    module: {
        rules: [
            { // sass / scss loader for webpack
                test: /\.scss$/,
                use: extractSass.extract([{
                    loader: 'css-loader' // translates CSS into CommonJS
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }])
            },

            {
                test: /\.svelte$/,
                exclude: /node_modules/,
                use: 'svelte-loader'
            }
        ]
    },

    plugins: [
        extractSass
    ]
};
