// swcrc.js
const path = require('path')
module.exports = {
    module: {
        type: 'es6',
        ignoreDynamic: true,
    },
    // polyfill
    env: {
        mode: 'usage', // or entry
        coreJs: 3,
        path: path.resolve(__dirname),
    },
    jsc: {
        parser: {
            syntax: 'typescript', // or ecmascript
            dynamicImport: true,
            decorators: true,
            tsx: true,
            privateMethod: false,
            functionBind: false,
            exportDefaultFrom: false,
            exportNamespaceFrom: false,
            decoratorsBeforeExport: false,
            topLevelAwait: false,
            importMeta: false
        },
        loose: true,
        target: 'es2015',
        externalHelpers: true,
        transform: { // default value is null
            legacyDecorator: true,
            decoratorMetadata: true,
        },
    },
}