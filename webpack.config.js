const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'calliope.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "var",
        library: "Calliope"
    },
};