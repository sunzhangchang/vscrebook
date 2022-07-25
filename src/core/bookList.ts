import { readFileSync } from "fs"
import _ from "lodash"
import { parse } from "path"
import { ExtensionContext, window } from "vscode"
import { setExtTo } from "../utils"
import { download, search } from "../crawl"
import { addBook } from "./add"
import { getConfig } from "./config"
import { myerror, Errors } from "../utils/error"

let context: ExtensionContext

export async function importList(listPath: string): Promise<void> {
    const list = JSON.parse(readFileSync(listPath, 'utf8')) as Record<string, BookInfo>

    _.forIn(list, async (v) => {
        const book = parse(v.bookName)

        search(book.name)
            .then((searchedList) => {
                const searchedBook = (() => {
                    for (const iter of searchedList) {
                        if (_.isEqual(book.name, iter.书名)) {
                            return iter
                        }
                    }
                    if (v.source === '本地') {
                        return
                    } else {
                        throw new Error(`导入书籍 《${book.name}》 失败!`)
                    }
                })()

                if (_.isUndefined(searchedBook)) {
                    return
                }

                download(searchedBook.书源, searchedBook.目录链接, getConfig().downloadPath, searchedBook.书名)
                    .then((bookPath) => {
                        if (_.isUndefined(bookPath)) {
                            throw new Error("下载出现错误!")
                        }
                        addBook(true, context.globalStorageUri.fsPath, setExtTo(bookPath, 'txt'), {
                            ...v,
                            source: searchedBook.书源,
                        }).then(() => {
                            window.showInformationMessage(`导入书籍 《${book.name}》 成功!`)
                        })
                    })
                    .catch(err => {
                        console.error((err as Error).message)
                    })
            })
            .catch((err) => {
                myerror(Errors.importSearchError)
                console.error((err as Error).message)
            })
    })
    window.showInformationMessage('书籍导入完成!')
}

export async function bookListInit(contex: ExtensionContext): Promise<void> {
    context = contex
    const t = getBookList()
    _.forIn(t, (v) => {
        const book = parse(v.bookName)
        delBookFromList(v.bookName)

        updateBook(book.name, {
            bookName: book.name,
            pageSize: v.pageSize,
            curPage: v.curPage,
            source: v.source ?? '本地',
        })
    })
}

export function delBookFromList(book: string): void {
    const books = getBookList()
    delete books[book]
    updateBookList(books)
}

export function getBookList(): Record<string, BookInfo> {
    const booksString = context.globalState.get('bookList', '{}')
    return JSON.parse(booksString)
}

export function getBook(bookName: string): BookInfo {
    return getBookList()[bookName] ?? {}
}

export function updateBook(bookName: string, bookInfo: BookInfo): void {
    const books = getBookList()
    books[bookName] = bookInfo
    updateBookList(books)
}

export function updateBookList(value: unknown): void {
    context.globalState.update('bookList', JSON.stringify(value))
}
