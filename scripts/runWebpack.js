//@ts-check

const webpack = require('webpack')
const log = require('fancy-log')
const PluginError = require('plugin-error')

function runWebpack(config, msg, cb) {
    webpack(config).run((err, stats) => {
        if (err) {
            throw new PluginError(`webpack:${msg}`, err)
        }
        log(`[webpack:${msg}]`, stats.toString({
            colors: true
        }))
        cb()
    })
}

exports.default = runWebpack
exports.runWebpack = runWebpack
