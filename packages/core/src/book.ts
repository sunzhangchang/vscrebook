import { BookIsNull, readBookFile } from "@vscrebook/utils"
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

    get book(): B | BookIsNull { return this._book ?? BookIsNull.yes }
    set book(v: B | BookIsNull) { this._book = BookIsNull.is(v) ? null : v }

    constructor(
        private updateBook: (k: string, v: BookInfo) => Promise<void>
    ) {
    }

    async newBook(pageSize: number, path?: string, source?: Source): Promise<boolean> {
        if (_.isUndefined(path)) {
            this.book = BookIsNull.yes
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

    async getPageNumber(curPage: number, jumpPage?: number): Promise<number | BookIsNull> {
        if (BookIsNull.is(this.book)) {
            return BookIsNull.yes
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

    async getStartEnd(pageSize: number, curPage: number): Promise<[number, number] |  BookIsNull> {
        if (_.isNull(this.book)) {
            return BookIsNull.yes
        }

        const ed: number = curPage * pageSize
        return [ed - pageSize, ed]
    }

    async getPageText(curPage: number, pageSize: number, jumpPage?: number): Promise<string | BookIsNull> {
        if (BookIsNull.is(this.book)) {
            return BookIsNull.yes
        }

        const page = await this.getPageNumber(curPage, jumpPage)

        if (BookIsNull.is(page)) {
            return BookIsNull.yes
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

        const tmp = await this.getStartEnd(pageSize, page)

        if (BookIsNull.is(tmp)) {
            return BookIsNull.yes
        }

        const [st, ed] = tmp
        return `${this.book.text.substring(st, ed)}    ${page}/${this.book.totPage}`
    }
}
