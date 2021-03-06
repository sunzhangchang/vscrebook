import { readFileSync } from "fs"
import _ from "lodash"
import { parse } from "path"
import { getBook, updateBook } from "./core/bookList"
import { getConfig } from "./core/config"
import { showBossText } from "./core/show"

export let book: {
    text: string,
    totPage: number,
    name: string,
    source: Source,
} | null = null

function readBookFile(path: string) {
    if (_.isUndefined(path) || _.isEmpty(path)) {
        return ''
    }
    const data: string = readFileSync(path, 'utf-8')
    const text = _(data)
        .chain()
        .trim()
        .replace(/[\r]+/g, '')
        .replace(/[\t\u3000 ]+/g, ' ')
        .replace(/[\n]+/g, ' ')
        .value()
    return text

}

export function newBook(path?: string, source?: Source): void {
    // console.log(path)
    if (_.isUndefined(path)) {
        book = null
        showBossText()
        return
    }

    const src = source ?? '本地'

    // console.log(src)

    book = {
        text: readBookFile(path),
        totPage: 0,
        name: parse(path).name,
        source: src,
    }
    book.totPage = Math.ceil(book.text.length / getConfig().pageSize)
}

export function getPageNumber(jumpPage?: number): number | null {
    if (_.isNull(book)) {
        return null
    }

    let page = jumpPage ?? getBook(book.name).curPage

    if (page < 0) {
        page = 0
    }

    if (page > book.totPage + 1) {
        page = book.totPage + 1
    }

    return page
}

function getStartEnd(): [number, number] | undefined {
    if (_.isNull(book)) {
        return
    }

    const pageSize = getConfig().pageSize
    const ed: number = getBook(book.name).curPage * pageSize
    return [ed - pageSize, ed]
}

export function getPageText(jumpPage?: number): string {
    if (_.isNull(book)) {
        return ''
    }

    const page = getPageNumber(jumpPage)

    if (_.isNull(page)) {
        return ''
    }

    updateBook(book.name, {
        bookName: book.name,
        pageSize: getConfig().pageSize,
        curPage: page,
        source: book.source,
    })

    if (page === 0) {
        return '您阅读到第一页了!'
    }

    if (page === book.totPage + 1) {
        return '您阅读到最后一页了!'
    }

    const tmp = getStartEnd()

    if (_.isUndefined(tmp)) {
        return ''
    }

    const [st, ed] = tmp
    return `${book.text.substring(st, ed)}    ${getBook(book.name).curPage}/${book.totPage}`
}
