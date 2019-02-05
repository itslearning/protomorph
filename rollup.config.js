import { ItslRollup } from './itsl.rollup';

export default ItslRollup({
    destination: './build/',
    files: [
        ['./src/index.js', 'index.bundle.js'],
        ['./src/index.aaa.scss', 'aaa.bundle.css'],
        ['./src/index.modern.scss', 'modern.bundle.css']
    ]
});
