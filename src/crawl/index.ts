import { writeFileSync } from "fs"
import _ from "lodash"
import { join, parse } from "path"
import { window } from "vscode"
import { myerror, Errors } from "../utils/error"
import axios from 'axios'
import { USER_AGENT } from "./utils"
import { Caimoge } from "./sub/caimoge"
import { Crawl } from "./Crawl"
import { setExtTo } from "../utils"
import { Wbxsw } from "./sub/wbxsw"
import { Aixiashu } from "./sub/aixiashu"
import axiosRetry from "axios-retry"

axiosRetry(axios, {
    retries: 3,
    shouldResetTimeout: true,
})

axios.defaults["axios-retry"] = {
    retries: 3,
    shouldResetTimeout: true,
}
axios.defaults.timeout = 1000
axios.defaults.headers.common['User-Agent'] = USER_AGENT
axios.defaults.responseType = 'arraybuffer'

// export async function search(searchKey: string): Promise<SearchBook[]> {
//     let list: SearchBook[]
//     _.forIn(configs, (pats, sourceName) => {
//         axios.get(format(pats.searchURL, searchKey)).then(res => {
//             const page = Buffer.from(res.data).toString()
//             const $ = load(page)
//             const names = $(pats)
//             const authors = (page.match(pats.作者 ?? 'never') ?? [])
//         })
//     })
// }

const crawlers: Crawl[] = [
    new Caimoge(),
    new Wbxsw(),
    new Aixiashu(),
]

export async function search(searchKey: string): Promise<SearchBook[]> {
    let list: SearchBook[] = []
    const p = crawlers.map(e => e.search(searchKey));
    (await Promise.all(p)).forEach(e => {
        list = _.concat(list, e)
    })
    // for (const iter of crawlers) {
    //     list = _.concat(list, (await iter.search(searchKey)) ?? [])
    //     mydebug("------  ", iter.sourceName, list)
    // }
    return list
}

// export async function search(searchKey: string): Promise<SearchBook[]> {
//     const res = (await search(searchKey)) as unknown as {
//         results: string,
//         errors: string,
//     }
//     console.log(JSON.parse(res.errors))
//     return JSON.parse(res.results)
// }

export async function download(source: string, menuURL: string, dir: string, name: string): Promise<string> {
    const spider = crawlers.find(iter => _.isEqual(iter.sourceName, source))

    if (_.isUndefined(spider)) {
        myerror(Errors.downloadNovelFailed)
        throw new Error(`${source} cannot find crawl!`)
    }

    const data = await spider.download(menuURL)

    if (_.isNull(data)) {
        myerror(Errors.downloadNovelFailed)
        throw new Error(`${menuURL} cannot fetch anything!`)
    }

    return (() => {
        const pth = join(dir, setExtTo(parse(name).name, 'txt'))
        writeFileSync(pth, data, {
            encoding: "utf8"
        })
        window.showInformationMessage('下载完成!')
        return pth
    })()
}

// // eslint-disable-next-line no-useless-escape
// const indexReg = /PART\b|^Prologue|Chapter\s*[-_]?\d+|分卷|^序$|^序\s*言|^序\s*章|^前\s*言|^附\s*[录錄]|^引\s*[言子]|^摘\s*要|^[楔契]\s*子|^后\s*记|^後\s*記|^附\s*言|^结\s*语|^結\s*語|^尾\s*[声聲]|^最終話|^最终话|^番\s*外|^\d+\s*\D*[^\d#\.]$|^[第（]?[\d〇零一二三四五六七八九十百千万萬-]+\s*[、）章节節回卷折篇幕集话話]/i
// const innerNextPage = /下一[页頁张張]|next\s*page|次のページ/i
