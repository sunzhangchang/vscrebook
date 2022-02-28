import { dirname, join } from "path"
import { argv } from "process"
import { run } from "./runCmd.mjs"

let arg

if (typeof argv[2] === 'undefined') {
    arg = ''
} else if (argv[2] === 'debug' || argv[1] === 'd') {
    arg = ':debug'
}

run(`cd ${join(dirname(new URL(import.meta.url).pathname), '../pkg/crawl')} && npm i && npm run build${arg}`).then(res => {
    console.log('ok')
})

// cd ./pkg/crawl && npm build:debug