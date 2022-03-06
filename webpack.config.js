//@ts-check

"use strict"

const path = require("path")
const swcrc = require("./.swcrc")

const env = process.env.NODE_ENV

const isDev = env ? env === 'development' : false

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
    target: "node",
    mode: "none",

    entry: "./src/extension.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
    },
    externals: {
        vscode: "commonjs vscode",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                loader: "swc-loader",
                options: swcrc(isDev),
            },
        ],
    },
}

module.exports = extensionConfig
