const fs = require('fs');
const path = require('path');

const babel = require('rollup-plugin-babel');
const { eslint } = require('rollup-plugin-eslint');
const resolve = require('@rollup/plugin-node-resolve');
const scss = require('rollup-plugin-scss');
const commonjs = require('@rollup/plugin-commonjs');
const svelte = require('rollup-plugin-svelte');
const { terser } = require('rollup-plugin-terser');

const defaultOptions = {
    legacy: false,
    webComponents: false,
    plugins: [],
    eslint: {
        configFile: 'node_modules/@itslearning/protomorph/.eslintrc.json',
    },
};

/**
 * Returns a Rollup Configuration Object for Svelte files with optional polyfills and es5 compatibility
 * @param {string} src The source file
 * @param {string} dest The destination file
 * @param {object} options
 * @param {boolean} [options.legacy] Include polyfills and support for older browsers
 * @param {boolean} [options.webComponents] Include polyfills for webComponents
 * @param {any[]} [options.plugins] Array of plugins to run in addition to the defaults
 * @param {object} [options.eslint] Eslint options, defaults to using protomorph eslintrc file
 * @returns {object} A Rollup Configuration Object
 */
const Svelte = (src, dest, options = defaultOptions) => ({
    input: src,
    output: {
        file: dest,
        format: 'iife',
        sourcemap: !options.legacy,
    },
    treeshake: true,
    plugins: [
        options.legacy && prepareES5(src, options),
        !options.legacy && eslint(options.eslint || defaultOptions.eslint),
        // @ts-ignore
        resolve({ extensions: [ '.js', '.mjs', '.html', '.svelte', '.json' ] }),
        svelte({ extensions: ['.html', '.svelte'] }),
        options.legacy ? babelPresetIE11 : babelPresetEdge,
        // @ts-ignore
        commonjs({
            extensions: ['.js', '.mjs', '.html', '.svelte'],
            namedExports: { 'chai': ['assert', 'expect'] },
        }),
        terser(),
        ...options.plugins || defaultOptions.plugins
    ],
});

function prepareES5(src, options) {
    const srcFile = path.resolve(src);

    return {
        name: 'Prepare bundle for ES5',
        transform: (code, id) => {
            if (srcFile !== id) {
                return code;
            } else {
                return `
import '@itslearning/protomorph/node_modules/core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';
${options.webComponents
        ? "import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';"
        : ''
}

Promise.resolve(); // dummy call to trigger polyfill of Promise
${code}`;
            }
        }
    };
}

const babelPresetIE11 = babel({
    exclude: [/\/core-js\//, '**/node_modules/@babel/runtime/**'],
    babelrc: false,
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                corejs: 3,
                targets: [ 'last 2 versions', 'not dead', 'ie 11' ],
                modules: false,
            }
        ],
    ],
    extensions: [ '.js', '.mjs', '.html', '.svelte' ]
});

const babelPresetEdge = babel({
    exclude: [/\/core-js\//, '**/node_modules/@babel/runtime/**'],
    babelrc: false,
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                corejs: 3,
                targets: { esmodules: true },
                modules: false,
            }
        ],
    ],
    extensions: [ '.js', '.mjs', '.html', '.svelte' ]
});

const sassOptions = {
    plugins: [],
};

/**
 * Returns a Rollup Configuration Object for Scss files
 * @param {string} src The source file
 * @param {string} dest The destination file
 * @param {object} options
 * @param {any[]} options.plugins Array of plugins to run in addition to the defaults
 * @returns {object} A Rollup Configuration Object
 */
const Sass = (src, dest, options = sassOptions) => ({
    input: src,
    // Required for Rollup, just ignore
    output: {
        file: dest,
        format: 'esm'
    },
    // Script will ALWAYS render an empty file at first, ignore EMPTY_BUNDLE
    onwarn: (warning, onwarn) => warning.code === 'EMPTY_BUNDLE' || onwarn(warning),
    plugins: [
        scss({
            importer(path) {
                return {
                    file: path.replace(/^~/, 'node_modules/')
                        .replace(/^@itslearning\//, 'node_modules/@itslearning/')
                };
            },
            output: `${dest}.temp`,
            outputStyle: 'compressed'
        }),
        {
            name: 'Rollup Sass Cleaner Plugin',
            /**
             * Renames the .temp file to .css overwriting the default javascript output
             */
            writeBundle: () => fs.renameSync(`${dest}.temp`, dest)
        },
        ...options.plugins || []
    ]
});

/**
 * Create an array of Rollup Configuration Objects
 * @param {object} config The required configuration
 * @param {string} config.destination The path where the generated file should be saved.
 * @param {Array<string[]>} config.files The files to be processed.
 * @param {any} config.plugins Additional rollup plugins to run.
 * @returns {object} A Rollup Configuration Object
 */
const ItslRollup = ({ destination, files, plugins = {} }) => {
    const configs = [];

    files.forEach(file => {
        const inFile = Array.isArray(file) ? file[0] : file;
        const outFile = Array.isArray(file) ? file[1] || inFile : file;

        const inPath = path.parse(inFile);
        const { name } = path.parse(outFile || inFile);

        if (inPath.ext !== '.js' && inPath.ext !== '.scss') {
            throw (new Error(`Unknown format ${inPath.ext}`));
        }

        if (inPath.ext === '.js') {
            configs.push(Svelte(inFile, `${destination}${name}.js`, { legacy: false, plugins: plugins.script }));
            configs.push(Svelte(inFile, `${destination}${name}.es5.js`, { legacy: true, plugins: plugins.script }));
        } else if (inPath.ext === '.scss') {
            configs.push(Sass(inFile, `${destination}${name}.css`, plugins.style));
        }
    });

    return configs;
};

module.exports = {
    ItslRollup,
    Svelte,
    Sass,
};
