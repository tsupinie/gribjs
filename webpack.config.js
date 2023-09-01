const path = require('path');

module.exports = {
    entry: './src/ts/index.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'grib.js',
        clean: true,
        globalObject: 'this',
        library: {
            name: 'grib',
            type: 'umd',
        }
    },

    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },

        compress: true,
        port: 9090,
    }
};