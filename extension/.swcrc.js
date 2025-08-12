// @ts-check

'use strict'


// swcrc.js

/** @typedef {import('@swc/core').Config} SwcrcConfig **/

module.exports = (isDev = false) => {
    /** @type { SwcrcConfig } */
    const config = {
        module: {
            type: "es6",
            ignoreDynamic: true,
        },
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
