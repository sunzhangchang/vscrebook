import { BookIsNull } from "@vscrebook/utils"
import _ from "lodash"
import type { Source } from "./types"

export type BookDocument = {
    text: string,
    totPage: number,
    name: string,
    source: Source,
}

type BookLoader = (path: string) => Pick<BookDocument, 'text' | 'name'> | Promise<Pick<BookDocument, 'text' | 'name'>>

export type BookPage = {
    page: number,
    text: string,
}

export class Book {
    private _book: BookDocument | null = null

    get book(): BookDocument | BookIsNull { return this._book ?? BookIsNull.yes }
    set book(v: BookDocument | BookIsNull) { this._book = BookIsNull.is(v) ? null : v }

    constructor(
        private loadBook: BookLoader,
    ) {
    }

    async newBook(pageSize: number, path?: string, source?: Source): Promise<boolean> {
        if (_.isUndefined(path)) {
            this.book = BookIsNull.yes
            return false
        }

        const src = source ?? '本地'
        const loadedBook = await this.loadBook(path)

        this.book = {
            text: loadedBook.text,
            totPage: 0,
            name: loadedBook.name,
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

    async getPageText(curPage: number, pageSize: number, jumpPage?: number): Promise<BookPage | BookIsNull> {
        if (BookIsNull.is(this.book)) {
            return BookIsNull.yes
        }

        const page = await this.getPageNumber(curPage, jumpPage)

        if (BookIsNull.is(page)) {
            return BookIsNull.yes
        }

        if (page === 0) {
            return { page, text: '您阅读到第一页了!' }
        }

        if (page === this.book.totPage + 1) {
            return { page, text: '您阅读到最后一页了!' }
        }

        const tmp = await this.getStartEnd(pageSize, page)

        if (BookIsNull.is(tmp)) {
            return BookIsNull.yes
        }

        const [st, ed] = tmp
        return {
            page,
            text: `${this.book.text.substring(st, ed)}    ${page}/${this.book.totPage}`,
        }
    }
}
