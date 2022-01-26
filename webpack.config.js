//@ts-check

"use strict"

const path = require("path")
const swcrc = require("./swcrc")
const esbuild = require('esbuild')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

const isDev = process.env.NODE_ENV

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
    target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
    },
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vsceignore file
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: [".ts", ".js"],
    },
    node: {
        __dirname: false,
    },
    optimization: {
        minimizer: [
            new ESBuildMinifyPlugin({
                target: 'es2015',
                legalComments: 'none',
                css: true,
                implementation: esbuild,
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                loader: "swc-loader",
                options: swcrc(isDev),
            },
            {
                test: /\.node$/,
                exclude: /node_modules/,
                loader: "node-loader",
                options: {
                    name: "[name].[ext]",
                    // name(resourcePath, resourceQuery) {
                    //     if (process.env.NODE_ENV === "development") {
                    //         return "[name].[ext]";
                    //     }
                    //     return "[contenthash].[ext]";
                    // },
                },
            },
        ],
    },
    devtool: "nosources-source-map",
}
module.exports = [extensionConfig]
