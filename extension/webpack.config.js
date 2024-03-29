//@ts-check

"use strict"

const { resolve } = require('path')
const swcrc = require('./.swcrc')

// const env = process.env.NODE_ENV

// const isDev = env ? env === 'development' : false

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const dir = __dirname

/** @type {(isDev: boolean) => WebpackConfig} */
const extensionConfig = (isDev) => {
    console.log(isDev)
    return {
        target: "node",
        mode: isDev ? 'development' : 'production',

        entry: "./src/extension.ts",
        output: {
            path: resolve(dir, "dist"),
            filename: "extension.js",
            libraryTarget: "commonjs2",
        },
        externals: {
            vscode: "commonjs vscode",
        },
        devtool: isDev ? 'eval-source-map' : false,
        experiments: {
            asyncWebAssembly: true,
            syncWebAssembly: true,
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
                {
                    test: /\.wasm$/,
                    type: 'webassembly/async',
                }
            ],
        },
    }
}

module.exports = extensionConfig
