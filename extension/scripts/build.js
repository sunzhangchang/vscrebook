// @ts-check

const { runRspack, watchRspack } = require('./runRspack')
const rspackConfig = require('../rspack.config')
const logger = require('fancy-log')
const cp = require('child_process')
const { existsSync, rmSync } = require('fs')

const args = process.argv.slice(2)

console.log(args)

/** @typedef {import('@rspack/core').Configuration} RspackConfig **/

// /** @type { {dev: WebpackConfig, prod: WebpackConfig, watch: WebpackConfig } } */
/** @type {RspackConfig} */
let config = {}
// const config = {
//     dev: {
//         ...webpackConfig(true),
//         mode: 'development',
//     },
//     prod: {
//         ...webpackConfig(false),
//         mode: 'production',
//     },
//     watch: {
//         ...webpackConfig(true),
//         mode: 'development',
//         watch: true,
//     }
// }

logger.info(`cwd: ${process.cwd()}`)

function clear() {
    logger.info('[clear] start clearing')
    if (existsSync('dist')) {
        rmSync('dist', {
            force: true,
            recursive: true,
        })
    } else if (existsSync('../dist')) {
        rmSync('../dist', {
            force: true,
            recursive: true,
        })
    }
    logger.info('[clear] finish clearing')
}

let mode = ''

switch (args[0]) {
    case 'dev': case '-d': case '--dev':
        mode = 'dev'
        config = rspackConfig(true)
        break

    case 'prod': case '-p': case '--prod': default:
        clear()
        mode = 'prod'
        config = rspackConfig(false)
        break

    case 'watch': case '-w': case '--watch':
        mode = 'watch'
        config = {
            ...rspackConfig(true),
            watch: true,
        }
        break
}

logger.info('[extension] start building')
!(
    (mode === 'watch' ? watchRspack : runRspack)(
        config,
        'dev',
        () => {
            logger.info('[extension] build succedful!')
        }
    )
)
