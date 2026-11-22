import { rsDownload, rsSearch } from "@vscrebook/crawl"
import { Errors, setExtTo } from "@vscrebook/utils"
import { writeFileSync } from "fs"
import _ from "lodash"
import { join, parse } from "path"

export class Crawl {
    constructor(
        private info: ShowMsg,
        private error: (err: string | Errors) => void,
    ) {
    }

    async search(searchKey: string): Promise<SearchBook[]> {
        this.info('正在搜索')
        try {
            const res = await rsSearch(searchKey)
            const errors = res[1] as string[]
            errors.forEach(e => this.error(e))
            return res[0]
        } catch (e) {
            this.error((e as Error).message)
            throw e
        }
    }

    async download(source: string, menuURL: string, dir: string, name: string): Promise<string | undefined> {
        return rsDownload(source, menuURL).then(res => {
            if (_.isUndefined(res)) {
                this.error('下载出现错误')
                return undefined
            }

            const path = join(dir, setExtTo(parse(name).name, 'txt'))

            writeFileSync(path, res, {
                encoding: 'utf-8'
            })

            this.info('下载完成!')
            return path
        }).catch(err => {
            this.error((err as Error).message)
            return undefined
        })
    }

}