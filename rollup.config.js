import ItslRollup from '@itslearning/protomorph/itsl.rollup';

const destination = './build/';

export default [
    /* Svelte command takes an optional third argument (options) with fields:
        legacy (default false): compiles to es5
        plugins: extra plugins to run after default ones
    */
    Svelte('./src/index.js', destination + 'index.bundle.js'),
    Svelte('./src/index.js', destination + 'index.bundle.es5.js', { legacy: true }),
    /* Sass command takes an optional thrid arguments (options) with fields:
        plugins: extra plugins to run after default ones
    */
    Sass('./src/theme.aaa.scss', destination + 'aaa.bundle.css'),
    Sass('./src/theme.modern.scss', destination + 'modern.bundle.css'),
];
