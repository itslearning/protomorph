import { ItslRollup } from './itsl.rollup';

export default ItslRollup({
    destination: './build/',
    files: [
        './src/index.js',
        './src/index.aaa.scss',
        './src/index.modern.scss'
    ]
});
