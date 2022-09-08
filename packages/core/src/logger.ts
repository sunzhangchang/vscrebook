const isDev = process.env.mode === 'development'

class Logger {
    constructor(
        private showInfo: ShowMsg,
        private showWarn: ShowMsg,
        private showError: ShowMsg
    ) {
    }

    info = isDev ? (msg: string) => {
        console.log(msg)
    } : (msg: string) => {
    }
}