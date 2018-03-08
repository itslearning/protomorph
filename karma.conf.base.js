/**
 * This file will not work out of the box with karma.
 *
 * @example
 * const baseConfig = require('@itslearning/protomorph/karma.conf');
 * const overrides = {...your overrides};
 * const overridenConfig = Object.assign({}, baseConfig, overrides);
 *
 * module.exports = function (config) {
 *   config.set(overridenConfig);
 * };
 */
module.exports = {
    basePath: '',

    frameworks: [
        'mocha',
        'dirty-chai',
        'chai-dom',
        'chai'
    ],

    files: [
        // The files required to test, including tests
        // The files must be built first if they use import statements.
        'dist/**/*.spec.bundle.js'
    ],

    preprocessors: {},

    browsers: ['ChromeHeadlessNoSandbox'],

    customLaunchers: {
        ChromeHeadlessNoSandbox: {
            base: 'ChromeHeadless',
            flags: [
                '--no-sandbox'
            ]
        }
    },

    reporters: ['mocha'],

    failOnEmptyTestSuite: false,
    singleRun: true
};
