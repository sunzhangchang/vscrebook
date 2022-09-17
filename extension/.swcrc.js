// @ts-check

'use strict'

const { resolve } = require('path')


// swcrc.js

/** @typedef {import('@swc/core').Config} SwcrcConfig **/

module.exports = (isDev = false) => {
    // polyfill
    const polyfillConfig = isDev ? {} : {
        env: {
            /** @type { 'usage' | 'entry' | undefined } */
            mode: "usage",
            coreJs: "3",
            path: resolve(__dirname),
        },
    }

    /** @type { SwcrcConfig } */
    const config = {
        module: {
            type: "es6",
            ignoreDynamic: true,
        },
        ...polyfillConfig,
        jsc: {
            parser: {
                syntax: "typescript",
                tsx: false,
                decorators: true,
                dynamicImport: true,
            },
            loose: true,
            target: 'es2022',
            externalHelpers: true,
            transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
            }
        },
        minify: !isDev,
        sourceMaps: isDev,
    }
    return config
}
