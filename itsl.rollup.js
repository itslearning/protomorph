import fs from 'fs';
import path from 'path';

import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import scss from 'rollup-plugin-scss';
import svelte from 'rollup-plugin-svelte';
import { uglify } from 'rollup-plugin-uglify';

/**
 * Returns a Rollup Configuration Object for Svelte files
 * @param {string} src The source file
 * @param {string} dest The destination file
 * @returns {object} A Rollup Configuration Object
 */
const Svelte = (src, dest) => ({
    input: src,
    output: {
        file: dest,
        format: 'iife'
    },
    treeshake: true,
    plugins: [
        eslint(),
        svelte(),
        babel({
            babelrc: false,
            presets: [['@babel/env', { modules: false }]],
            extensions: ['.js', '.svelte']
        }),
        uglify()
    ],
});

/**
 * Returns a Rollup Configuration Object for Scss files
 * @param {string} src The source file
 * @param {string} dest The destination file
 * @returns {object} A Rollup Configuration Object
 */
const Sass = (src, dest) => ({
    input: src,
    output: {
        file: dest,
        format: 'iife'
    },
    plugins: [
        scss({
            output: `${dest}.temp`,
            outputStyle: 'compact'
        }),
        svelte(),
        {
            name: 'Itslearning Rollup Sass Plugin',
            /**
             * Renames the .temp file to .css overwriting the default javascript output
             */
            writeBundle: () => fs.renameSync(`${dest}.temp`, dest)
        }
    ],
});

/**
 * Create an array of Rollup Configuration Objects
 * @param {object} config The required configuration
 * @param {string} config.destination The path where the generated file should be saved.
 * @param {Array<string>} config.files The files to be processed.
 * @returns {object} A Rollup Configuration Object
 */
export const ItslRollup = ({ destination, files }) =>
    files.map(file => {
        const { ext, name } = path.parse(file);

        if (ext !== '.js' && ext !== '.scss') {
            throw(`Unknown format ${ext}`);
        }
        return ext === '.js'
            ? Svelte(file, `${destination}${name}.js`)
            : ext === '.scss'
            ? Sass(file, `${destination}${name}.css`)
            : false;
    });
