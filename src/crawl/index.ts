import { writeFileSync } from "fs"
import _ = require("lodash")
import { join, parse } from "path"
import { window } from "vscode"
import { error, Errors } from "../utils/error"
import axios from 'axios'
import { USER_AGENT } from "./utils"
import { caimoge } from "./sub/caimoge"
import { Crawl } from "./inter"

axios.defaults.headers.common['User-Agent'] = USER_AGENT
axios.defaults.responseType = 'arraybuffer'

let crawlers: Crawl[] = [caimoge]

export async function search(searchKey: string) {
    if (_.isEmpty(crawlers)) {
        return []
    }
    // console.log('123123123')
    let list: SearchBook[] = []
    list = _.concat(list, await crawlers[0].search(searchKey) ?? [])
    // return (() => {
    //     crawlers.forEach((crawl) => {
    //         crawl.search(searchKey).then(res => {
    //             list = _.concat(list, res ?? [])
    //             // console.log(list)
    //         })
    //     })
    //     // console.log(123, list)
    //     return list
    // })()
    return list
}

export async function download(source: string, menuURL: string, dir: string, name: string) {
    let data = await crawlers.filter((cra: Crawl) => {
        return _.isEqual(cra.source, source)
    })[0].download(menuURL)

    if (_.isNull(data)) {
        console.error(menuURL, 'cannot fetch anything!')
        error(Errors.downloadNovelFailed)
        return false
    }

    return (() => {
        let pth = join(dir, parse(name).name + '.txt')
        writeFileSync(pth, data, {
            encoding: "utf8"
        })
        window.showInformationMessage('下载完成!')
        return true
    })()
}
