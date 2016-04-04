var path = require('path');
var webpack = require('webpack');

var APP_DIR = path.join(__dirname, 'dist');

module.exports = {
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    entry: {
        index: [
            'babel-polyfill',
            'webpack/hot/dev-server',
            'webpack-dev-server/client?http://0.0.0.0:4242/',
            path.resolve(APP_DIR, 'init', 'index.web.js')
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: '/'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['react-hot', 'babel-loader?cacheDirectory&presets[]=es2015'],
            include: APP_DIR,
            exclude: /node_modules/
        }]
    },
    resolve: {
        root: [path.resolve('../src')],
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'BABEL_ENV': JSON.stringify('web')
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};
