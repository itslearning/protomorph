const fs = require('fs');
const path = require('path');

const babel = require('rollup-plugin-babel');
const { eslint } = require('rollup-plugin-eslint');
const resolve = require('rollup-plugin-node-resolve');
const scss = require('rollup-plugin-scss');
const commonjs = require('rollup-plugin-commonjs');
const svelte = require('rollup-plugin-svelte');
const { terser } = require('rollup-plugin-terser');

/**
 * Returns a Rollup Configuration Object for Svelte files as modules without polyfills or es5 compatibility
 * @param {string} src The source file
 * @param {string} dest The destination file
 * @param {boolean} legacy Include polyfills and support for older browsers
 * @returns {object} A Rollup Configuration Object
 */
const Svelte = (src, dest, legacy, scriptPlugins = []) => ({
    input: src,
    output: {
        file: dest,
        format: legacy ? 'iife' : 'esm',
        sourcemap: !legacy,
    },
    treeshake: true,
    plugins: [
        legacy && prepareES5(src),
        // @ts-ignore
        resolve({ extensions: [ '.js', '.mjs', '.html', '.svelte', '.json' ] }),
        svelte({ extensions: ['.html', '.svelte'] }),
        legacy && babelPreset,
        // @ts-ignore
        commonjs({
            extensions: ['.js', '.mjs', '.html', '.svelte'],
            namedExports: { 'chai': ['assert', 'expect'] },
        }),
        terser(),
        ...scriptPlugins
    ],
});

function prepareES5(src) {
    const srcFile = path.resolve(src);

    return {
        name: 'Prepare bundle for ES5',
        transform: (code, id) => {
            if (srcFile !== id) {
                return code;
            } else {
                return `
                import 'core-js/stable';
                import 'regenerator-runtime/runtime';
                import 'whatwg-fetch';
                import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';

                Promise.resolve(); // dummy call to trigger polyfill of Promise
                ${code}
                `;
            }
        }
    };
}

const babelPreset = babel({
    exclude: [/\/core-js\//, '**/node_modules/@babel/runtime/**'],
    babelrc: false,
    externalHelpers: false,
    runtimeHelpers: true,
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

/**
 * Returns a Rollup Configuration Object for Scss files
 * @param {string} src The source file
 * @param {string} dest The destination file
 * @returns {object} A Rollup Configuration Object
 */
const Sass = (src, dest, stylePlugins = []) => ({
    input: src,
    // Required for Rollup, just ignore
    output: {
        file: dest,
        format: 'esm'
    },
    // Script will ALWAYS render an empty file at first
    onwarn: (warning) => warning.code === 'EMPTY_BUNDLE' ? false : warning,
    plugins: [
        scss({
            importer(path) {
                return { file: path.replace(/^~/, 'node_modules/') };
            },
            output: `${dest}.temp`,
            outputStyle: 'compact'
        }),
        {
            name: 'Rollup Sass Cleaner Plugin',
            /**
             * Renames the .temp file to .css overwriting the default javascript output
             */
            writeBundle: () => fs.renameSync(`${dest}.temp`, dest)
        },
        ...stylePlugins
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
            configs.push(Svelte(inFile, `${destination}${name}.js`, false, plugins.script));
            configs.push(Svelte(inFile, `${destination}${name}.es5.js`, true, plugins.script));
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
