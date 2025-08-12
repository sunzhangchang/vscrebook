//@ts-check

const { rspack } = require('@rspack/core')
const log = require('fancy-log')

// eslint-disable-next-line @typescript-eslint/naming-convention
const PluginError = require('plugin-error')

/** @typedef {import('@rspack/core').Configuration} RspackConfig **/

/**
 * @param { RspackConfig } config
 * @param {*} msg
 * @param {*} cb
 */
async function runRspack(config, msg, cb) {
    rspack(config).run((err, stats) => {
        if (err) {
            throw new PluginError(`webpack:${msg}`, err)
        }
        log(`[rspack:${msg}]`, stats?.toString({
            colors: true
        }))
        cb()
    })
}

/**
 * @param { RspackConfig } config
 * @param {*} msg
 * @param {*} cb
 */
async function watchRspack(config, msg, cb) {
    const run = (err, stats) => {
        if (err) {
            throw new PluginError(`rspack:${msg}`, err)
        }
        log(`[rspack:${msg}]`, stats?.toString({
            colors: true
        }))
        cb()
    }
    rspack(config, run)?.watch({}, () => {})
}

module.exports = {
    default: runRspack,
    runRspack: runRspack,
    watchRspack: watchRspack,
}
