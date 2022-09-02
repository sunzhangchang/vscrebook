const env = process.env.NODE_ENV

const isDev = env ? env === 'development' : false

export function mydebug(message?: unknown, ...optionalParams: unknown[]): void {
    isDev && console.log(message, ...optionalParams)
}