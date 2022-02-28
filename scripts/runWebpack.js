const webpack = require('webpack')
const gutil = require('gulp-util')

function runWebpack(config, msg, cb) {
    webpack(config).run((err, stats) => {
        if (err) {
            throw new gutil.PluginError(`webpack:${msg}`, err)
        }
        gutil.log(`[webpack:${msg}]`, stats.toString({
            colors: true
        }))
        cb()
    })
}

exports.default = runWebpack
exports.runWebpack = runWebpack
