import { getBook, updateBook } from "../utils/bookList"
import { window } from "vscode"
import _ = require("lodash")
import { readFileSync } from "fs"
import { getConfig } from "../utils/config"

// TODO 实时更新txt内容

export default class Book {
    text: string = ''
    totPage: number = 0
    pageSize: number = 0
    lineBreak: string = ' '
    bpath: string = ''
    name: string = ''

    constructor(bpath: string, text?: string) {
        if (bpath.length === 0) {
            this.text = ''
            this.name = ''
            return
        }
        this.text = !_.isUndefined(text) ? text : ''
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
        if (_.isUndefined(this.text)) {
            return 0
        }
        return Math.ceil(this.text.length / this.pageSize)
    }

    getPageNumber(jumpPage?: number): number | string {
        if (_.isUndefined(jumpPage)) {
            return getBook(this.name).curPage
        }
        if (jumpPage < 0) {
            return 'head'
        }
        if (jumpPage > this.totPage) {
            return 'tail'
        }
        return jumpPage
    }

    getStartEnd(): [number, number] {
        let ed: number = getBook(this.name).curPage * this.pageSize
        return [ed - this.pageSize, ed]
    }

    readFile(): string {
        let bpath = this.bpath
        if (_.isUndefined(bpath) || _.isEmpty(bpath)) {
            return ''
        }
        let data: string = readFileSync(bpath, 'utf-8')
        let lineBreak = getConfig().lineBreak
        let text = data.trim().replace(/[\r]+/g, '').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, lineBreak)
        return text
    }

    onConfigChange(): boolean {
        let { lineBreak, pageSize } = getConfig()
        return !_.isEqual(lineBreak, this.lineBreak) || !_.isEqual(pageSize, this.pageSize)
    }

    refresh() {
        this.init()
        this.text = this.readFile()
        this.totPage = this.getSize()
        window.setStatusBarMessage(this.text)
    }

    getPageText(jumpPage?: number): string {
        if (this.onConfigChange()) {
            this.refresh()
        }

        if (_.isUndefined(this.text)) {
            return ''
        }

        let page = this.getPageNumber(jumpPage)

        if (_.isEqual(page, 'head')) {
            return '已经是第一页了!'
        }
        if (_.isEqual(page, 'tail')) {
            return '已经到最后一页了!'
        }

        let oPage = page as number

        updateBook(this.name, {
            bookPath: this.bpath,
            curPage: oPage
        })
        let [st, ed] = this.getStartEnd()

        return `${this.text.substring(st, ed)}    ${getBook(this.name).curPage}/${this.totPage}`
    }
}