const path = require('path');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SassLintPlugin = require('sasslint-webpack-plugin');
const babelOptions = require('./.babelrc.json');
const AwesomeCshtmlPlugin = require('./awesome-svelte/awesome-cshtml-plugin');
const PrometheusSvelteLoaderExtension = require('./itslearning-svelte/prometheus-loader');

const AwesomeSvelteHelpers = require('./awesome-svelte/helpers');

const sassLinter = new SassLintPlugin({
    configFile: path.join(__dirname, '.sass-lint.yml'),
    glob: '!(node_modules/)**/*.scss',
    failOnError: true,
    ignorePlugins: ['extract-text-webpack-plugin']
});

const defaultOptions = {
    allowedContextItems : [
        'CurrentUserFirstName',
        'CurrentUserName',
        'CurrentUserPictureUrl',
        'CdnPath'
    ],
    cshtmlPluginOptions : {
        filename: '../../Web/Areas/[area]/Views/Shared/[page].cshtml',
        modelFilename: '../../Web/Areas/[area]/Models/[page]ViewModel.cs',
        modelNamespace: 'Itsolutions.Itslearning.Web.Areas.[area].Models',
        templateFilename: path.join(__dirname, '/itslearning-svelte/view.template.cshtml'),
        vsprojFilename: '../../Itsolutions.Itslearning.Web.csproj',
        staticFolderPath: '../../../StaticContent'
    },
    cssExtractPluginOptions: { 
        filename: '[name]/[name].bundle.min.css' 
    },
    viewLoaderOptions: {
        scriptTemplateFilename: path.join(__dirname, '/itslearning-svelte/view.template.js'),
        styleTemplateFilename: path.join(__dirname, '/itslearning-svelte/view.template.sass')
    },
    sassPreprocessorOptions: {
        additionalImports: [
            './src/Styles/common'
        ]
    },
    awesomeSvelteLoaderExtensions: [
        {
            instance: PrometheusSvelteLoaderExtension,
            options: {
                templateFilename: path.join(__dirname, '/itslearning-svelte/prometheus.modern.sass')
            }
        }
    ]
};

/**
 * @typedef {Object} ConfigurationOptions
 * @property {Array<string>} options.allowedContextItems List of allowed context items to be used like $$context.<item>.
 * @property {Object} options.cshtmlPluginOptions Options for cshtml plugin.
 * @property {Object} options.cssExtractPluginOptions Options for cshtml plugin.
 * @property {Object} options.viewLoaderOptions Options for view.json loader.
 * @property {Object} options.sassPreprocessorOptions Options for sass pre-processor.
 * @property {Array<Object>} options.awesomeSvelteLoaderExtensions List of extenstions for awesome svelte loader.
 */

/**
 * Creates default configuration for webpack using provided options.
 * @param {ConfigurationOptions} consumerOptions Options for the configuration.
 */
function initConfiguration(consumerOptions) {
    const options = Object.assign({}, defaultOptions, consumerOptions);
    
    return {
        optimization: {
            minimize: true,
            minimizer: [new UglifyJsPlugin({
                include: /\.min\.js$/,
                sourceMap: true,
                uglifyOptions: { output: { comments: false } }
            })]
        },
        plugins: [
            sassLinter,
            new MiniCssExtractPlugin(options.cssExtractPluginOptions),
            new AwesomeCshtmlPlugin(options.cshtmlPluginOptions)
        ],
        mode: process.env.NODE_ENV || 'development',

        resolve: {
            extensions: ['.ts', '.js', '.svelte', '.scss']
        },

        devtool: 'source-map',

        module: {
            rules: [
                {
                    test: /view\.json$/,
                    type: 'javascript/auto',
                    use: {
                        loader: path.join(__dirname, '/awesome-svelte/awesome-view-loader'),
                        options: options.viewLoaderOptions
                    },
                },

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
                    test: /\.(scss|css)$/,
                    use: [{
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                        options: {
                            url: false,
                            minimize: true
                        }
                    },
                    {
                        loader: 'sass-loader', // compiles Sass to CSS
                    }]
                },

                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                },

                {
                    test: /\.svelte$/,
                    use: [{
                        loader: 'svelte-loader',
                        options: {
                            emitCss: true,
                            store: true,
                            hydratable: true,
                            preprocess: {
                                style: AwesomeSvelteHelpers.svelteSassPreprocessor(options.sassPreprocessorOptions)
                            }
                        }
                    }, {
                        loader: path.join(__dirname, '/awesome-svelte/awesome-svelte-loader'),
                        options: {
                            contextItemValidator: AwesomeSvelteHelpers.simpleListContextItemValidator(options.allowedContextItems),
                            extensions: options.awesomeSvelteLoaderExtensions
                        }
                    }]
                },

                {
                    enforce: 'pre',
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'eslint-loader',
                    options: {
                        configFile: path.join(__dirname, '.eslintrc.json'),
                    }
                }
            ]
        }
    };
}

module.exports = initConfiguration;
