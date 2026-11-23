import type { ConfigBase, DownloadSettings, ShowMoreInfo } from "@vscrebook/config"
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

import { Errors } from '@vscrebook/utils/shared'

let config: {
    get showMoreInfo(): ShowMoreInfo
    set showMoreInfo(v: ShowMoreInfo)
    get downloadSettings(): DownloadSettings
    set downloadSettings(v: DownloadSettings)
}

export function getConfig(c: Pick<ConfigBase, 'showMoreInfo' | 'downloadSettings'>) {
    config = c
}

export let myerror: (s: string) => void
export let mydebug: (s: string) => void

export function getShowError(mye: (s: string | Errors) => void) {
    myerror = (s: string) => {
        const m = _.get(Errors, s)
        if (_.isUndefined(m)) {
            mye(s)
        } else {
            mye(m)
        }
    }
}

export function getShowDebug(mdebug: (s: string) => void) {
    mydebug = mdebug
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function get_config() {
    return {
        showMoreInfo: config.showMoreInfo,
        downloadSettings: config.downloadSettings,
    }
}
