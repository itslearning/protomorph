const del = require('del');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const importOnce = require('node-sass-import-once');
const SassLintPlugin = require('sasslint-webpack-plugin');
const babelOptions = require('./.babelrc.json');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');

const outputDir = path.join(process.cwd(), '/dist');

// We set the root to be the current running webpack directory, so
// if you are including this in your project, we aware, this will
// delete your dist folder before building another.
const cleanDistBeforeBuild = new CleanWebpackPlugin('dist', {
    root: process.cwd()
});

const sassLinter = new SassLintPlugin({
    configFile: path.join(__dirname, '.sass-lint.yml'),
    glob: '!(node_modules/)**/*.scss',
    failOnError: true,
    ignorePlugins: ['extract-text-webpack-plugin']
});

// This will extract the styles from the bundle.js file.
const extractCss = new MiniCssExtractPlugin({filename: '[name].bundle.css'});

// The js files webpack created for themes are no longer required
// after the text extract plugin removed all useful CSS from them.
const cleanUpThemeJsFiles = new WebpackOnBuildPlugin(() => {
    const tmpThemeBundles = path.resolve(outputDir, '**/*.thm.bundle.js');
    const tmpThemeBundleSourceMaps = path.resolve(outputDir, '**/*.thm.bundle.js.map');

    del.sync([
        tmpThemeBundles,
        tmpThemeBundleSourceMaps
    ]);
});

module.exports = {
    mode: process.env.NODE_ENV || 'development',

    resolve: {
        extensions: ['.ts', '.js', '.svelte', '.scss']
    },

    devtool: 'source-map',

    entry: {
        'index': [
            './src/index.js',
            './src/index.scss'
        ],

        'index.spec': './src/index.spec.js'
    },

    output: {
        path: outputDir,
        filename: '[name].bundle.js'
    },

    module: {
        rules: [
            {
                test: /\.(js|svelte)$/,
                use: {
                    loader: 'babel-loader',
                    options: babelOptions
                },
                // If you need to transpile any npm modules, you will need
                // to create your own exclude value
                // @see https://github.com/babel/babel-loader/issues/171
                exclude: new RegExp('node_modules\\' + path.sep + '(?![@itslearning|svelte])')
            },

            {
                test: /\.scss$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS
                    options: {
                        url: false
                    }
                }, {
                    loader: 'sass-loader', // compiles Sass to CSS
                    options: {
                        importer: importOnce
                    }
                }]
            },

            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },

            {
                test: /\.svelte$/,
                use: {loader: 'svelte-loader', options: {store: true}}
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
        cleanDistBeforeBuild,
        sassLinter,
        extractCss,
        // new OptimizeCSSAssetsPlugin(), // if you optimise, you lose the css source map
        cleanUpThemeJsFiles
    ]
};
