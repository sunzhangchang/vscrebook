import { accessSync, constants } from "fs"
import _ = require("lodash")
import { join, parse } from "path"
import { ExtensionContext, window } from "vscode"
import { setExtTo } from "."
import { download, search } from "../crawl"
import { addBook } from "../library/add"
import { getConfig, updateSyncBookList } from "./config"
import { debug } from "./debug"
import { error, Errors } from "./error"

let context: ExtensionContext

async function sync() {
    let sync: any = getConfig().sync
    for (const key in sync) {
        if (Object.prototype.hasOwnProperty.call(sync, key)) {
            const ele = sync[key] as BookInfo
            // debug(ele)
            const book = parse(ele.bookName)
            try {
                accessSync(join(context.globalStorageUri.fsPath, book.name), constants.F_OK)
            } catch (err) {
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
                        throw new Error(`同步书籍 ${book.name} 失败!`)
                    })()

                    // debug(searchedBook)

                    if (_.isUndefined(searchedBook)) {
                        continue
                    }

                    try {
                        const bookPath = await download(searchedBook.书源, searchedBook.目录链接, getConfig().downloadPath, searchedBook.书名)
                        // debug(bookPath)
                        // console.log(setExtTo(bookPath, 'txt'))
                        debug({
                            ...ele,
                            source: searchedBook.书源,
                        })
                        await addBook(context.globalStorageUri.fsPath, setExtTo(bookPath, 'txt'), {
                            ...ele,
                            source: searchedBook.书源,
                        })
                    } catch (err: any) {
                        console.error(err.message)
                    }
                } catch (err: any) {
                    error(Errors.syncSearchError)
                    console.error(err.message)
                }
            }
        }
    }
    window.showInformationMessage('书籍同步完成!')
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

    await sync()
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
    return getBookList()[bookName]
}

export function updateBook(bookName: string, bookInfo: BookInfo) {
    let books = getBookList()
    books[bookName] = bookInfo
    updateBookList(books)
}

let cnt = 0
let lastUpdate

export function updateBookList(value: any) {
    context.globalState.update('bookList', JSON.stringify(value))
    lastUpdate = value
    ++ cnt
    if (cnt >= 4) {
        updateSyncBookList(value)
        cnt = 0
    }
}
