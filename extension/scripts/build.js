// @ts-check

const { runWebpack, watchWebpack } = require('./runWebpack')
const webpackConfig = require('../webpack.config')
const logger = require('fancy-log')
const cp = require('child_process')
const { existsSync, rmSync } = require('fs')

const args = process.argv.slice(2)

console.log(args)

/** @typedef {import('webpack').Configuration} WebpackConfig **/

// /** @type { {dev: WebpackConfig, prod: WebpackConfig, watch: WebpackConfig } } */
/** @type {WebpackConfig} */
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
        config = webpackConfig(true)
        break

    case 'prod': case '-p': case '--prod': default:
        clear()
        mode = 'prod'
        config = webpackConfig(false)
        break

    case 'watch': case '-w': case '--watch':
        mode = 'watch'
        config = {
            ...webpackConfig(true),
            watch: true,
        }
        break
}

logger.info('[crawl] start building')
cp.execSync(`cd ../ && npm run -w @vscrebook/crawl build${mode === 'prod' ? '' : ':dev'}`)
logger.info('[crawl] finish building')

logger.info('[extension] start building')
!(
    (mode === 'watch' ? watchWebpack : runWebpack)(
        config,
        'dev',
        () => {
            logger.info('[extension] build succedful!')
        }
    )
)
