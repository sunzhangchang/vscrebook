//@ts-check

"use strict"

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import swcrc from './.swcrc'

const env = process.env.NODE_ENV

const isDev = env ? env === 'development' : false

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const dir = __dirname ?? dirname(fileURLToPath(import.meta.url))

/** @type WebpackConfig */
const extensionConfig = {
    target: "node",
    mode: "none",

    entry: "./src/extension.ts",
    output: {
        path: resolve(dir, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
    },
    externals: {
        vscode: "commonjs vscode",
    },
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

module.exports = extensionConfig
