const env = process.env.NODE_ENV

const isDev = env ? env === 'development' : false

export function debug(message?: any, ...optionalParams: any[]) {
    isDev && console.log(message, ...optionalParams)
}