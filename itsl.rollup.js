const fs = require('fs');
const path = require('path');

const babel = require('rollup-plugin-babel');
const { eslint } = require('rollup-plugin-eslint');
const resolve = require('rollup-plugin-node-resolve');
const scss = require('rollup-plugin-scss');
const svelte = require('rollup-plugin-svelte');
const { uglify } = require('rollup-plugin-uglify');

/**
 * Returns a Rollup Configuration Object for Svelte files
 * @param {string} src The source file
 * @param {string} dest The destination file
 * @returns {object} A Rollup Configuration Object
 */
const Svelte = (src, dest, scriptPlugins = [], svelteOptions) => ({
    input: src,
    output: {
        file: dest,
        format: 'iife'
    },
    treeshake: true,
    plugins: [
        resolve({
            extensions: ['.svelte', '.js']
        }),
        eslint(),
        svelte(svelteOptions || {}),
        babel({
            babelrc: false,
            presets: [['@babel/env', { modules: false }]],
            extensions: ['.js', '.svelte']
        }),
        uglify(),
        ...scriptPlugins
    ],
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
 * @param {Array<string>} config.files The files to be processed.
 * @returns {object} A Rollup Configuration Object
 */
const ItslRollup = ({ destination, files, plugins = {}, svelteOptions = {} }) =>
    files.map(file => {
        const inFile = Array.isArray(file) ? file[0] : file;
        const outFile = Array.isArray(file) ? file[1] || inFile : file;

        const { ext } = path.parse(inFile);
        const { name } = path.parse(outFile || inFile);

        if (ext !== '.js' && ext !== '.scss') {
            throw(`Unknown format ${ext}`);
        }
        return ext === '.js'
            ? Svelte(inFile, `${destination}${name}.js`, plugins.script, svelteOptions)
            : ext === '.scss'
            ? Sass(inFile, `${destination}${name}.css`, plugins.style)
            : false;
    });

module.exports = {
    ItslRollup
};
