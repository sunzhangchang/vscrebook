import { exec } from "child_process"

export function run(cmd, returnString = 'dummy') {
    console.log(`Try to run ${cmd}.`)
    let child = exec(cmd)
    let res = {
        stdout: '',
        stderr: '',
        exitCode: 0
    }
    return new Promise((resolve, reject) => {
        child.stdout?.on('data', (data) => {
            res.stdout += data
            if (returnString !== 'dummy') {
                if (res.stdout.includes(returnString)) {
                    resolve(res)
                }
            }
        })
        child.stderr?.on('data', (data) => {
            res.stderr += data
        })
        child.on('close', (code) => {
            res.exitCode = code === null ? 0 : code
            resolve(res)
        })
    })
}
