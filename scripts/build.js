const path = require('path')
const { run } = require('./runCmd')

exports.build = (argv) => {
    let arg
    if (typeof argv === 'undefined') {
        arg = ''
    } else if (argv === 'debug') {
        arg = ':debug'
    } else {
        console.error('argv err')
        return
    }
    run(`cd ${path.join(__dirname, '../pkg/crawl')} && npm i && npm run build${arg}`).then(res => {
        console.log('ok')
    })
}

// cd ./pkg/crawl && npm build:debug