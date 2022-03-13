import { accessSync, constants } from "fs"
import _ = require("lodash")
import { basename, join } from "path"
import { ExtensionContext } from "vscode"
import { search } from "../crawl"
import { getConfig, updateSyncBookList } from "./config"

let context: ExtensionContext

export function bookListInit(contex: ExtensionContext) {
    context = contex
    let t = getBookList()
    // console.log(t)
    for (const key in t) {
        if (Object.prototype.hasOwnProperty.call(t, key)) {
            const ele = t[key]
            if (!_.isUndefined(ele['bookName'])) {
                let bookName = ele['bookName'] as string
                if (_.endsWith(bookName, '.txt')) {
                    delBookFromList(bookName)
                    let newBookName = bookName.substring(0, bookName.)
                    updateBook(bookName, {
                        bookName,
                        pageSize: getConfig().pageSize,
                        curPage: e.curPage,
                    })
                }
                continue
            }
            const e = ele as {
                bookPath: string,
                curPage: number,
            }
            // console.log(e)
            let bookName = basename(e.bookPath, 'txt')
            delBookFromList(bookName)
            updateBook(bookName, {
                bookName,
                pageSize: getConfig().pageSize,
                curPage: e.curPage,
            })
        }
    }

    let sync = Object.create(getConfig().sync)
    for (const key in sync) {
        if (Object.prototype.hasOwnProperty.call(sync, key)) {
            const ele = sync[key]
            let bookName = ele['bookName']
            if (_.endsWith(bookName, '.txt')) {
            }
            try {
                accessSync(join(context.globalStorageUri.fsPath, bookName), constants.F_OK)
            } catch (err) {
                search(bookName)
            }
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
    return getBookList()[bookName]
}

export function updateBook(bookName: string, bookInfo: BookInfo) {
    let books = getBookList()
    books[bookName] = bookInfo
    updateBookList(books)
}

export function updateBookList(value: any) {
    context.globalState.update('bookList', JSON.stringify(value))
    updateSyncBookList(value)
}
