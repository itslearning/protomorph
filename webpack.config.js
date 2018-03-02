const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SassLintPlugin = require('sasslint-webpack-plugin');

// const thisDir = __filename__dir;

const sassLinter = new SassLintPlugin({
    configFile: path.join(__dirname, '.sass-lint.yml'),
    glob: '!(node_modules/)**/*.scss',
    failOnError: true,
    ignorePlugins: ['extract-text-webpack-plugin']
});

// This will extract the styles from the bundle.js file.
const extractSass = new ExtractTextPlugin({filename: '[name].bundle.css'});

module.exports = {
    resolve: {
        extensions: ['.js', '.svelte', '.scss']
    },

    entry: {
        'index': [
            './src/index.js',
            './src/index.scss'
        ],

        'index.spec': './src/index.spec.js'
    },

    output: {
        path: path.join(process.cwd(), '/dist'),
        filename: '[name].bundle.js'
    },

    module: {
        rules: [
            { // sass / scss loader for webpack
                test: /\.scss$/,
                use: extractSass.extract([{
                    loader: 'css-loader', // translates CSS into CommonJS
                    options: {
                        url: false
                    }
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }])
            },

            {
                test: /\.(js|svelte)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },

            {
                test: /\.svelte$/,
                exclude: /node_modules/,
                use: 'svelte-loader'
            },

            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    configFile: path.join(__dirname, '.eslintrc.json')
                }
            }
        ]
    },

    plugins: [
        extractSass,
        sassLinter
    ]
};
