import { readFileSync } from "fs"
import _ = require("lodash")
import { parse } from "path"
import { ExtensionContext, window } from "vscode"
import { setExtTo } from "."
import { download, search } from "../crawl"
import { addBook } from "../core/add"
import { getConfig } from "../core/config"
// import { debug } from "./debug"
import { error, Errors } from "./error"

let context: ExtensionContext

export async function importList(listPath: string) {
    // debug(context.globalStorageUri.fsPath)
    let list = JSON.parse(readFileSync(listPath, 'utf8'))

    for (const key in list) {
        if (Object.prototype.hasOwnProperty.call(list, key)) {
            const ele = list[key] as BookInfo
            // debug(ele)
            const book = parse(ele.bookName)

            // debug('Done here ! ! !')

            try {
                const list = await search(book.name)
                const searchedBook = (() => {
                    for (const iter of list) {
                        if (_.isEqual(book.name, iter.书名)) {
                            return iter
                        }
                    }
                    if (_.isEqual(ele.source, '本地')) {
                        return
                    }
                    throw new Error(`导入书籍 ${book.name} 失败!`)
                })()

                // debug(searchedBook)

                if (_.isUndefined(searchedBook)) {
                    continue
                }

                try {
                    const bookPath = await download(searchedBook.书源, searchedBook.目录链接, getConfig().downloadPath, searchedBook.书名)
                    await addBook(context.globalStorageUri.fsPath, setExtTo(bookPath, 'txt'), {
                        ...ele,
                        source: searchedBook.书源,
                    })
                    window.showInformationMessage(`导入书籍 ${book.name} 成功!`)
                } catch (err: any) {
                    console.error(err.message)
                }
            } catch (err: any) {
                error(Errors.importSearchError)
                console.error(err.message)
            }
        }
    }
    window.showInformationMessage('书籍导入完成!')
}

export async function bookListInit(contex: ExtensionContext) {
    context = contex
    let t = getBookList()
    // console.log(t)
    for (const key in t) {
        if (Object.prototype.hasOwnProperty.call(t, key)) {
            const ele = t[key]
            if (!_.isUndefined(ele['bookName'])) {
                const e = ele as BookInfo
                const book = parse(e.bookName)
                delBookFromList(e.bookName)

                updateBook(book.name, {
                    bookName: book.name,
                    pageSize: e.pageSize,
                    curPage: e.curPage,
                    source: ele['source'] ?? '本地',
                })
                continue
            }
            const e = ele as {
                bookPath: string,
                curPage: number,
            }
            // console.log(e)
            const book = parse(e.bookPath)
            delBookFromList(e.bookPath)

            updateBook(book.name, {
                bookName: book.name,
                pageSize: getConfig().pageSize,
                curPage: e.curPage,
                source: '本地',
            })
        }
    }
}

export function delBookFromList(book: string) {
    let books = getBookList()
    delete books[book]
    updateBookList(books)
}

export function getBookList() {
    let booksString = context.globalState.get('bookList', '{}')
    return JSON.parse(booksString)
}

export function getBook(bookName: string): BookInfo {
    let book = getBookList()[bookName]
    // debug('000', book)
    return book ?? {}
}

export function updateBook(bookName: string, bookInfo: BookInfo) {
    let books = getBookList()
    books[bookName] = bookInfo
    updateBookList(books)
}

export function updateBookList(value: any) {
    context.globalState.update('bookList', JSON.stringify(value))
}
