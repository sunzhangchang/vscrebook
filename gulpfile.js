const gulp = require('gulp')
const fs = require('fs')

function clear(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', {
            force: true,
            recursive: true,
        })
    } else if (fs.existsSync('../dist')) {
        fs.rmSync('../dist', {
            force: true,
            recursive: true,
        })
    }
    cb()
}

const { runWebpack, watchWebpack } = require('./scripts/runWebpack')
const webpackConfig = require('./webpack.config')

let devConfig = Object.create(webpackConfig)
devConfig.mode = "development"

async function dev(cb) {
    runWebpack(devConfig, 'build-dev', cb)
}

const esbuild = require('esbuild')
// eslint-disable-next-line @typescript-eslint/naming-convention
const { ESBuildMinifyPlugin } = require('esbuild-loader')

let prodConfig = Object.create(webpackConfig)
prodConfig.mode = 'production'
prodConfig.devtool = 'hidden-source-map'
webpackConfig.optimization = {
    minimize: true,
    minimizer: [
        new ESBuildMinifyPlugin({
            target: 'es2020',
            legalComments: 'none',
            css: true,
            implementation: esbuild,
        })
    ]
}

async function prod(cb) {
    runWebpack(prodConfig, 'build-prod', cb)
}

let watchConfig = Object.create(devConfig)
watchConfig.watch = true

async function watch(cb) {
    watchWebpack(watchConfig, 'watch', cb)
}

module.exports = {
    clear,
    dev: gulp.series(dev),
    watch: gulp.series(watch),
    prod: gulp.series(clear, prod),
}
