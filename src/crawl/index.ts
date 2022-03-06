import { SearchBook } from "crawl"
import { writeFileSync } from "fs"
import _ = require("lodash")
import { join, parse } from "path"
import { window } from "vscode"
import { error, Errors } from "../utils/error"
import { caimoge } from "./sub/caimoge"

export async function search(searchKey: string) {
    let searchBooks: SearchBook[] = []

    let data = await caimoge.search(searchKey)
    if (_.isNull(data)) {
        return null
    }
    searchBooks = _.concat(searchBooks, data)

    return searchBooks
}

export async function download(url: string, dir: string, name: string) {
    let data = await caimoge.download(url)

    if (_.isNull(data)) {
        console.error(url, 'cannot fetch anything!')
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
