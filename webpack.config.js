const path = require('path');

module.exports = {
    entry: './frontend/index.js',
    output: {
        path: path.resolve(__dirname, 'frontend', 'public'),
        filename: 'bundle.js',
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
devServer: {
    static: path.resolve(__dirname, 'frontend', 'public'),
    port: 8080,
    hot: true,
    client: {
        webSocketURL: {
            hostname: 'localhost',
            port: 8080,
        },
    },
    proxy: [
        {
            context: ['/api'],  
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
        },
    ],
}
};
