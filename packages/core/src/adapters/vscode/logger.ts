import { Errors, myerror } from "@vscrebook/utils"

const isDev = process.env.mode === 'development'

export class Logger {
    constructor(
        private showInfo: ShowMsg,
        private showWarn: ShowMsg,
        private showError: ShowMsg
    ) {
    }

    info = isDev ? (msg: string) => {
        console.log(msg)
    } : (msg: string) => {
        console.log(msg)
        this.showInfo(msg)
    }

    warn = isDev ? (msg: string) => {
        console.warn(msg)
    } : (msg: string) => {
        console.warn(msg)
        this.showWarn(msg)
    }

    error = isDev ? (err: string | Errors) => {
        const msg = myerror(err)
        console.error(msg)
        throw Error(msg)
    } : (err: string | Errors) => {
        const msg = myerror(err)
        this.showError(msg)
        throw Error(msg)
    }
}
