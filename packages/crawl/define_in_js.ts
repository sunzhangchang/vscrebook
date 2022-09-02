import { ConfigBase } from "@vscrebook/config"
import { Memento } from "@vscrebook/utils"
import _ from "lodash"
import fetch, { Headers, Request, Response } from "node-fetch"

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

export { mydebug } from '@vscrebook/utils'
import { myerror as mye, Errors } from '@vscrebook/utils'

export function myerror(s: string) {
    const m = _.get(Errors, s)
    if (_.isUndefined(m)) {
        mye(s)
    } else {
        mye(m)
    }
}

let config: {
    get showMoreInfo(): ShowMoreInfo
    set showMoreInfo(v: ShowMoreInfo)
    get downloadSettings(): DownloadSettings
    set downloadSettings(v: DownloadSettings)
}

export function getConfig<C extends Memento>(c: ConfigBase<C>) {
    config = c
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function get_config() {
    return {
        showMoreInfo: config.showMoreInfo,
        downloadSettings: config.downloadSettings,
    }
}
