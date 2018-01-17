module.exports = function (config) {
    config.set({
        basePath: '',

        frameworks: [
            'mocha',
            'chai',
            'dirty-chai'
        ],

        files: [
            // The files required to test, including tests
            // The files must be built first if they use import statements.
            'build/**/*.spec.js'
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
    });
};
