import _ = require("lodash")
import { basename } from "path"
import { ExtensionContext } from "vscode"
import { getConfig } from "./config"

let context: ExtensionContext

export function bookListInit(contex: ExtensionContext) {
    context = contex
    let t = getBookList()
    // console.log(t)
    for (const key in t) {
        if (Object.prototype.hasOwnProperty.call(t, key)) {
            const ele = t[key]
            if (!_.isUndefined(ele['bookName'])) {
                continue
            }
            const e = ele as {
                bookPath: string,
                curPage: number,
            }
            // console.log(e)
            let bookName = basename(e.bookPath)
            delBookFromList(bookName)
            updateBook(bookName, {
                bookName,
                pageSize: getConfig().pageSize,
                curPage: e.curPage,
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
    return getBookList()[bookName]
}

export function updateBook(bookName: string, bookInfo: BookInfo) {
    let books = getBookList()
    books[bookName] = bookInfo
    updateBookList(books)
}

export function updateBookList(value: any) {
    context.globalState.update('bookList', JSON.stringify(value))
}
