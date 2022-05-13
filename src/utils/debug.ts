const env = process.env.NODE_ENV

const isDev = env ? env === 'development' : false

export function mydebug(message?: any, ...optionalParams: any[]) {
    isDev && console.log(message, ...optionalParams)
}