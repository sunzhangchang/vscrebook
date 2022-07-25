import { window } from "vscode"
import axios from 'axios'
import { USER_AGENT } from "./utils"
import axiosRetry from "axios-retry"
import { rsDownload, rsSearch } from "../../crawl/pkg/crawl"

axiosRetry(axios, {
    retries: 3,
    shouldResetTimeout: true,
})

axios.defaults["axios-retry"] = {
    retries: 3,
    shouldResetTimeout: true,
}
axios.defaults.timeout = 3000
axios.defaults.headers.common['User-Agent'] = USER_AGENT
axios.defaults.responseType = 'arraybuffer'

export async function search(searchKey: string): Promise<SearchBook[]> {
    window.showInformationMessage('正在搜索')
    try {
        const res = (await rsSearch(searchKey)) as {
            results: string
            errors: string
        }
        const errors = JSON.parse(res.errors) as string[]
        console.error(errors)
        errors.forEach(e => window.showErrorMessage(e))
        return JSON.parse(res.results)
    } catch(e) {
        console.error(e)
        window.showErrorMessage((e as Error).message)
        throw e
    }
}

export async function download(source: string, menuURL: string, dir: string, name: string): Promise<string> {
    return rsDownload(source, menuURL, dir, name)
}
