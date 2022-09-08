import { readBookFile } from "@vscrebook/utils"
import _ from "lodash"
import { parse } from "path"

type B = {
    text: string,
    totPage: number,
    name: string,
    source: Source,
}

export class Book {
    private _book: B | null = null

    get book(): B | null { return this._book }
    set book(v: B | null) { this._book = v }

    constructor(
        private updateBook: (k: string, v: BookInfo) => Promise<void>
    ) {
    }

    async newBook(pageSize: number, path?: string, source?: Source): Promise<boolean> {
        if (_.isUndefined(path)) {
            this.book = null
            return false
        }

        const src = source ?? '本地'

        this.book = {
            text: readBookFile(path),
            totPage: 0,
            name: parse(path).name,
            source: src,
        }
        this.book.totPage = Math.ceil(this.book.text.length / pageSize)
        return true
    }

    async getPageNumber(curPage: number, jumpPage?: number): Promise<number | null> {
        if (_.isNull(this.book)) {
            return null
        }

        let page = jumpPage ?? curPage

        if (page < 0) {
            page = 0
        }

        if (page > this.book.totPage + 1) {
            page = this.book.totPage + 1
        }

        return page
    }

    async getStartEnd(pageSize: number, curPage: number): Promise<[number, number] | undefined> {
        if (_.isNull(this.book)) {
            return
        }

        const ed: number = curPage * pageSize
        return [ed - pageSize, ed]
    }

    async getPageText(curPage: number, pageSize: number, jumpPage?: number): Promise<string> {
        if (_.isNull(this.book)) {
            return ''
        }

        const page = await this.getPageNumber(curPage, jumpPage)

        if (_.isNull(page)) {
            return ''
        }

        await this.updateBook(this.book.name, {
            bookName: this.book.name,
            pageSize,
            curPage: page,
            source: this.book.source,
        })

        if (page === 0) {
            return '您阅读到第一页了!'
        }

        if (page === this.book.totPage + 1) {
            return '您阅读到最后一页了!'
        }

        const tmp = await this.getStartEnd(pageSize, curPage)

        if (_.isUndefined(tmp)) {
            return ''
        }

        const [st, ed] = tmp
        return `${this.book.text.substring(st, ed)}    ${curPage}/${this.book.totPage}`
    }
}
