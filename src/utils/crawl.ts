import { window } from "vscode"
import { rsSearch, rsDownload } from "../../pkg/crawl"
import _ = require("lodash")
import { error, Errors } from "./error"
import { join } from "path"
import { getConfig } from "./config"

export async function search(searchKey: string) {
    return await rsSearch(searchKey)
}

export async function download(inputUrl: string, bookName: string) {
    let _bookName = bookName.slice()
    if (!_.endsWith(bookName, '.txt')) {
        _bookName += '.txt'
    }

    let downloadPath = join(getConfig().downloadPath, _bookName)

    return rsDownload(inputUrl, downloadPath).then(() => {
        window.showInformationMessage('下载完成!')
    }).catch(err => {
        console.error(err)
        error(Errors.unknowError)
    })
}
