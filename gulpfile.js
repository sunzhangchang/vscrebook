const gulp = require('gulp')

const { build } = require('./scripts/build.js')

function devCrawl(cb) {
    build('debug')
    cb()
}

function prodCrawl(cb) {
    build()
    cb()
}

const { runWebpack } = require('./scripts/runWebpack')
const webpackConfig = require('./webpack.config')

let devConfig = Object.create(webpackConfig)
devConfig.mode = "development"

function dev(cb) {
    runWebpack(devConfig, cb)
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
            target: 'es2015',
            legalComments: 'none',
            css: true,
            implementation: esbuild,
        })
    ]
}

function prod(cb) {
    runWebpack(prodConfig, cb)
}

let watchConfig = Object.create(devConfig)
watchConfig.watch = true

function watch(cb) {
    runWebpack(watchConfig, cb)
}

module.exports = {
    devCrawl,
    prodCrawl,
    dev: gulp.series(devCrawl, dev),
    watch: gulp.series(devCrawl, watch),
    prod: gulp.series(prodCrawl, prod),
}
