import { writeFileSync } from "fs"
import _ from "lodash"
import { join, parse } from "path"
import { window } from "vscode"
import { rsDownload, rsSearch } from "../../crawl/pkg/crawl"
import { mydebug } from "../define_in_js"
import { setExtTo } from "../utils"
import { myerror } from "../utils/error"

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

export async function download(source: string, menuURL: string, dir: string, name: string): Promise<string | undefined> {
    return rsDownload(source, menuURL).then(res => {
        if (_.isUndefined(res)) {
            myerror('下载出现错误')
            return undefined
        }

        const path = join(dir, setExtTo(parse(name).name, 'txt'))

        mydebug(res)

        writeFileSync(path, res, {
            encoding: 'utf-8'
        })

        window.showInformationMessage('下载完成!')
        return path
    }).catch(err => {
        myerror((err as Error).message)
        return undefined
    })
}
