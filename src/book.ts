import { readFileSync } from "fs"
import _ = require("lodash")
import { basename } from "path"
import { getBook, updateBook } from "./utils/bookList"
import { getConfig } from "./utils/config"

export let book: {
    text: string,
    totPage: number,
    name: string,
} | null = null

function readBookFile(path: string) {
    if (_.isUndefined(path) || _.isEmpty(path)) {
        return ''
    }
    let data: string = readFileSync(path, 'utf-8')
    let text = data.trim().replace(/[\r]+/g, '').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, ' ')
    return text

}

export function newBook(path?: string) {
    if (_.isUndefined(path)) {
        book = null
        return
    }
    book = {
        text: readBookFile(path),
        totPage: 0,
        name: basename(path),
    }
    book.totPage = Math.ceil(book.text.length / getConfig().pageSize)
}

export function getPageNumber(jumpPage?: number) {
    if (_.isNull(book)) {
        return null
    }

    if (_.isUndefined(jumpPage)) {
        let page = getBook(book.name).curPage
        return page === 0 ? 1 : page
    }
    if (jumpPage <= 0) {
        return 0
    }
    if (jumpPage > book.totPage) {
        return book.totPage + 1
    }
    return jumpPage
}

function getStartEnd(): [number, number] | undefined {
    if (_.isNull(book)) {
        return
    }

    const pageSize = getConfig().pageSize
    let ed: number = getBook(book.name).curPage * pageSize
    return [ed - pageSize, ed]
}

export function getPageText(jumpPage?: number): string {
    if (_.isNull(book)) {
        return ''
    }

    let page = getPageNumber(jumpPage)

    if (_.isNull(page)) {
        return ''
    }

    updateBook(book.name, {
        bookName: book.name,
        pageSize: getConfig().pageSize,
        curPage: page
    })

    if (page === 0) {
        return '您阅读到第一页了!'
    }

    if (page === book.totPage + 1) {
        return '您阅读到最后一页了!'
    }

    let tmp = getStartEnd()

    if (_.isUndefined(tmp)) {
        return ''
    }

    let [st, ed] = tmp
    return `${book.text.substring(st, ed)}    ${getBook(book.name).curPage}/${book.totPage}`
}
