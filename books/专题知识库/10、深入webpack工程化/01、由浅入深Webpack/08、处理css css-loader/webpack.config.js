const path = require('path');

module.exports = {
    entry: {
        app: './src/app.js'
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        publicPath: './dist/'
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            singleton: true,
                            transform: './css.transform.js'
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: true,
                            modules: true,
                            localIdentName: '[path][name]_[local]_[hash:base64:5]'
                        },
                        // loader: 'file-loader'
                    }
                ]
            }
        ]
    }
};