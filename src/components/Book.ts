import * as vscode from "vscode"
import * as fs from "fs"
import { defaultPageSize } from "../utils"
import { getConfig, getWsConfig } from "../utils/operConfig"
import { getBook, updateBook } from "../utils/operBookList"

// TODO 实时更新txt内容

export default class Book {
    text: string = ''
    totPage: number = 0
    pageSize: number = defaultPageSize
    lineBreak: string = ' '
    bpath: string = ''
    name: string = ''

    constructor(bpath: string, text?: string) {
        if (bpath.length === 0) {
            this.text = ''
            this.name = ''
            return
        }
        this.text = text ? text : ''
        this.bpath = bpath
        let nameArr: string[] = this.bpath.split('\\')
        this.name = nameArr[nameArr.length - 1]
        this.init()
        this.refresh()
    }

    init(): void {
        let config: ConfigType = getConfig()
        this.lineBreak = config.lineBreak
        this.pageSize = config.pageSize
    }

    getSize(): number {
        if (!this.text) { return 0 }
        return Math.ceil(this.text.length / this.pageSize)
    }

    getPageNumber(option: string, jumpPageNumber?: string | undefined): number {
        const curPage = getBook(this.name).curPage
        let page: number = 0
        if (option === 'prev') {
            page = curPage <= 1 ? 1 : curPage - 1
        } else if (option === 'next') {
            page = curPage >= this.totPage ? this.totPage : curPage + 1
        } else if (option === 'jump') {
            page = (jumpPageNumber ? (+jumpPageNumber) : curPage)
        }
        return page
    }

    getStartEnd(): [number, number] {
        let ed: number = getBook(this.name).curPage * this.pageSize
        return [ed - this.pageSize, ed]
    }

    readFile(): string {
        let bpath = this.bpath
        if (bpath === '' || typeof bpath === 'undefined') { return '' }
        let data: string = fs.readFileSync(bpath, 'utf-8')
        let lineBreak: string = getWsConfig('vscrebook.lineBreak') as string
        let text = data.trim().replace(/[\r]+/g, '').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, lineBreak)
        return text
    }

    onConfigChange(): boolean {
        let { lineBreak, pageSize } = getConfig()
        return lineBreak !== this.lineBreak || pageSize !== this.pageSize
    }

    refresh() {
        this.init()
        this.text = this.readFile()
        this.totPage = this.getSize()
        vscode.window.setStatusBarMessage(this.text)
    }

    getPageText(option: string, jumpPageNumber?: string | undefined): string {
        if (this.onConfigChange()) {
            this.refresh()
        }
        if (!this.text) { return '' }
        updateBook(this.name, {
            bookPath: this.bpath,
            curPage: this.getPageNumber(option, jumpPageNumber)
        })
        let [st, ed] = this.getStartEnd()

        return `${this.text.substring(st, ed)}    ${getBook(this.name).curPage}/${this.totPage}`
    }
}