import { writeFileSync } from "fs"
import _ = require("lodash")
import { join, parse } from "path"
import { window } from "vscode"
import { error, Errors } from "../utils/error"
import axios from 'axios'
import { USER_AGENT } from "./utils"
import { Caimoge } from "./sub/caimoge"
import { Crawl } from "./inter"

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
    // console.log(123, list)
    return list
}

export async function download(source: string, menuURL: string, dir: string, name: string) {
    console.log(source)
    let spider = (() => {
        for (const iter of crawlers) {
            if (_.isEqual(iter.sourceName, source)) {
                return iter
            }
        }
        return null
    })()
    if (_.isNull(spider)) {
        console.error(source, 'cannot find crawl!')
        error(Errors.downloadNovelFailed)
        return null
    }
    console.log(spider)
    let data = await spider.download(menuURL)

    if (_.isNull(data)) {
        console.error(menuURL, 'cannot fetch anything!')
        error(Errors.downloadNovelFailed)
        return null
    }

    return (() => {
        let pth = join(dir, parse(name).name + '.txt')
        writeFileSync(pth, data, {
            encoding: "utf8"
        })
        window.showInformationMessage('下载完成!')
        return pth
    })()
}
