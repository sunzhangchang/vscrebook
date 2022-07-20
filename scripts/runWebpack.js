//@ts-check

const webpack = require('webpack')
const log = require('fancy-log')
// eslint-disable-next-line @typescript-eslint/naming-convention
const PluginError = require('plugin-error')

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/**
 * @param { WebpackConfig } config
 * @param {*} msg
 * @param {*} cb
 */
async function runWebpack(config, msg, cb) {
    webpack(config).run((err, stats) => {
        if (err) {
            throw new PluginError(`webpack:${msg}`, err)
        }
        log(`[webpack:${msg}]`, stats?.toString({
            colors: true
        }))
        cb()
    })
}

exports.default = runWebpack
exports.runWebpack = runWebpack
