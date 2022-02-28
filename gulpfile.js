const gulp = require('gulp')
const gutil = require('gulp-util')

const { build } = require('./scripts/build.js')

function devCrawl(cb) {
    build('debug')
    cb()
}

function prodCrawl(cb) {
    build()
    cb()
}

const webpack = require('webpack')
const webpackConfig = require('./webpack.config')

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
    console.log('here')
    runWebpack(watchConfig, cb)
}

exports.devCrawl = devCrawl
exports.prodCrawl = prodCrawl
exports.dev = gulp.series(devCrawl, dev)
exports.watch = gulp.series(devCrawl, watch)
exports.prod = gulp.series(prodCrawl, prod)
