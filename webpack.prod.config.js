var path = require('path');
var webpack = require('webpack');

var APP_DIR = path.join(__dirname, 'dist');

module.exports = {
    devtool: 'source-map',
    entry: [
        'babel-polyfill',
        path.resolve(APP_DIR, 'init', 'index.web.js')
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: '/'
    },
    resolve: {
        root: [path.resolve('../src')],
        extensions: ['', '.js']
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['babel-loader?presets[]=es2015'],
            include: APP_DIR,
            exclude: /node_modules/
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'BABEL_ENV': JSON.stringify('web')
            }
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({minimize: true}),
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 20})
    ]
};
