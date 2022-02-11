import { window } from "vscode"
import { rsSearch, rsDownload } from "../../pkg/crawl"
import { defaultDownloadPath, ExtConfig, getWsConfig, updateWsConfig } from "./config"
import _ = require("lodash")
import { error, Errors } from "./error"
import { join } from "path"

export async function search(searchKey: string) {
    return await rsSearch(searchKey)
}

export async function download(inputUrl: string, bookName: string) {
    if (_.isUndefined(getWsConfig(ExtConfig.downloadPath))) {
        updateWsConfig(ExtConfig.downloadPath, defaultDownloadPath, true)
    }

    let _bookName = bookName.slice()
    if (!_.endsWith(bookName, '.txt')) {
        _bookName += '.txt'
    }

    let downloadPath = join(getWsConfig(ExtConfig.downloadPath) as string, _bookName)

    rsDownload(inputUrl, downloadPath).then(async () => {
        await window.showInformationMessage('下载完成!')
    }).catch(err => {
        console.error(err)
        error(Errors.unknowError)
    })
}
