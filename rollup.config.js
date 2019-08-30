import ItslRollup from '@itslearning/protomorph/itsl.rollup';

export default ItslRollup({
    destination: './build/',
    files: [
        ['./src/index.js', 'index.bundle.js'],
        ['./src/theme.aaa.scss', 'aaa.bundle.css'],
        ['./src/theme.modern.scss', 'modern.bundle.css']
    ],
    plugins: {
        script: [
            // Add any extra rollup-plugin for the javascript bundling.
            // Note that these will run after the default ones.
        ],
        style: [
            // Add any extra rollup-plugin for the styles bundling.
            // Note that these will run after the default ones.
        ]
    }
});
