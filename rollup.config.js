import ItslRollup from '@itslearning/protomorph/itsl.rollup';

export default ItslRollup({
    destination: './build/',
    files: [
        ['./src/index.js', 'index.bundle.js'],
        ['./src/theme.aaa.scss', 'aaa.bundle.css'],
        ['./src/theme.modern.scss', 'modern.bundle.css']
    ]
});
