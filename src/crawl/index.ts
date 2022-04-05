import { writeFileSync } from "fs"
import _ = require("lodash")
import { join, parse } from "path"
import { window } from "vscode"
import { error, Errors } from "../utils/error"
import axios from 'axios'
import { USER_AGENT } from "./utils"
import { Caimoge } from "./sub/caimoge"
import { Crawl } from "./inter"
import { setExtTo } from "../utils"

axios.defaults.headers.common['User-Agent'] = USER_AGENT
axios.defaults.responseType = 'arraybuffer'

let crawlers: Crawl[] = [
    new Caimoge()
]

export async function search(searchKey: string) {
    if (_.isEmpty(crawlers)) {
        return []
    }
    let list: SearchBook[] = []
    for (const iter of crawlers) {
        list = _.concat(list, (await iter.search(searchKey)) ?? [])
    }
    return list
}

export async function download(source: string, menuURL: string, dir: string, name: string) {
    let spider = (() => {
        for (const iter of crawlers) {
            if (_.isEqual(iter.sourceName, source)) {
                return iter
            }
        }
        return null
    })()

    if (_.isNull(spider)) {
        error(Errors.downloadNovelFailed)
        throw new Error(`${source} cannot find crawl!`)
    }

    let data = await spider.download(menuURL)

    if (_.isNull(data)) {
        error(Errors.downloadNovelFailed)
        throw new Error(`${menuURL} cannot fetch anything!`)
    }

    return (() => {
        let pth = join(dir, setExtTo(parse(name).name, 'txt'))
        writeFileSync(pth, data, {
            encoding: "utf8"
        })
        window.showInformationMessage('下载完成!')
        return pth
    })()
}
