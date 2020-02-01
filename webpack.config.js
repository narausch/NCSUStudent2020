'use strict';

const path = require('path');

module.exports = {
    // Set debugging source maps to be "inline" for
    // simplicity and ease of use
    devtool: 'inline-source-map',
    mode: process.env.NODE_ENV,

    // The application entry point
    entry: {
        contentscript: './src/contentscript/contentscript.ts',
        background: './src/background/background.ts',
    },

    // Where to compile the bundle
    // By default the output directory is `dist`
    output: {
        path: __dirname + '/dist/js',
        filename: '[name].js',
    },

    // Supported file loaders
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
        ],
    },

    // File extensions to support resolving
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
};
