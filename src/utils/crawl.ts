import { window } from "vscode"
import { crawl } from "../../pkg/crawl"
import { defaultDownloadPath, ExtConfig, getWsConfig, updateWsConfig } from "./operConfig"

function urlFaild() {
    window.showErrorMessage('请输入正确的小说目录链接(目前只支持采墨阁(www.caimoge.net))!')
}

export function jscrawl(inputUrl: string | undefined) {
    if (typeof inputUrl === 'undefined') {
        urlFaild()
    } else {
        if (!getWsConfig(ExtConfig.downloadPath)) {
            updateWsConfig(ExtConfig.downloadPath, defaultDownloadPath, true)
        }
        let res = crawl(inputUrl, getWsConfig(ExtConfig.downloadPath) as string)
        if (res === 'Url_faild') {
            urlFaild()
        } else if (res === 'Ok') {
            window.showInformationMessage('下载完成!')
        }
    }
}