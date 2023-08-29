const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

console.log(__dirname)
module.exports = () => {
    let folderPath = 'test'

    const urlIndexts = `${folderPath}/ts/index.ts`
    const urlIndex = `${folderPath}/index.html`
    const urlDist = `dist/${folderPath}/`

    console.log('folder: ', folderPath)

    return {
        entry: path.resolve(__dirname, urlIndexts),
        resolve: {
            fallback: {
                fs: false,
            },
            extensions: ['.js', '.ts'],
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader',
                },
            ],
        },
        output: {
            path: path.resolve(__dirname, urlDist),
            filename: '[name].[chunkhash].js',
            chunkFilename: '[name].[chunkhash].js',
            clean: true,
        },
        devServer: {
            static: path.resolve(__dirname, urlDist),
            host: '0.0.0.0',
            port: 8080,
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, urlIndex),
                filename: 'index.html',
                title: folderPath,
                inject: 'body',
            }),
        ],
    }
}
