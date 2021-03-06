import _ from "lodash"
import fetch, { Headers, Request, Response } from "node-fetch"
import { getConfig } from "./core/config"

// declare type Source =
//     | '本地'
//     | '采墨阁'
//     | '58小说网'
//     | '爱下书小说网'

// declare type obj = Record<string, unknown>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Headers = Headers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Request = Request;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Response = Response;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Window = Object;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = fetch

export { mydebug } from './utils/debug'
import { myerror as mye, Errors } from './utils/error'

export function myerror(s: string) {
    const m = _.get(Errors, s)
    if (_.isUndefined(m)) {
        mye(s)
    } else {
        mye(m)
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function get_config() {
    return {
        showMoreInfo: getConfig().showMoreInfo,
        threadNum: getConfig().threadNum,
        downloadSettings: getConfig().downloadSettings,
    }
}
