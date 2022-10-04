import cp from 'child_process'
import logger from 'fancy-log'

const args = process.argv.slice(2)

let scope = args[0] ?? ''
const cmdd = args[1] ?? 'build'
let env = args[2] ?? ''

const scopes = ['ext', 'crawl',]
const envs = ['dev', 'prod', '',]

if (!scopes.includes(scope)) {
    logger.error('Please provide the scope!')
    process.exit(1)
}

logger.info(`Running build script with: ${scope}, ${env}`)

let cmd = ''

switch (env) {
    case 'dev': {
        if (cmdd === 'package' || cmdd === 'publish') {
            logger.error('Cannot be packaged using the development environment!')
            process.exit(1)
        }
        cmd = `${cmdd}:dev`
        break
    }

    case 'prod': case '': {
        cmd = `${cmdd}`
        break
    }

    default: {
        logger.error('Unknown environment! Available: "dev", "prod", "watch", "" aka "prod"')
        process.exit(1)
    }
}

const map = {
    'ext': {
        name: 'ext',
        scope: 'extension',
        cmd: {
            'build': 'build',
            'build:dev': 'build dev',
            'package': 'package',
            'publish': 'publish',
        },
        deps: ['crawl'],
    },
    'crawl': {
        name: 'crawl',
        cmd: {
            'build': 'build',
            'build:dev': 'build:dev',
            'package': 'build',
            'publish': 'build',
        },
        scope: '@vscrebook/crawl',
    },
}

function doTask(task) {
    if (task.deps) {
        for (const dep of task.deps) {
            doTask(map[dep])
        }
    }

    const command = `npm run ${task.cmd[cmd]} -w ${task.scope}`

    logger.info(`[${task.name}] Running command: '${command}'`)
    cp.execSync(command, {
        stdio: 'inherit',
    })
}

doTask(map[scope])
