const webpack = require('webpack')
const gutil = require('gulp-util')

function runWebpack(config, cb) {
    webpack(config).run((err, stats) => {
        if (err) {
            throw new gutil.PluginError("webpack:build-dev", err)
        }
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }))
        cb()
    })
}

exports.default = runWebpack
exports.runWebpack = runWebpack
