import { ExtensionContext } from "vscode"
import Book from "../components/Book"

export function getBookList(context: ExtensionContext) {
    let booksString = context.globalState.get('bookList', '{}')
    return JSON.parse(booksString)
}

export function updateBookListKV(context: ExtensionContext, key: string, value: BookInfo) {
    let books = getBookList(context)
    books[key] = value
    updateBookList(context, books)
}

export function updateBookList(context: ExtensionContext, value: any) {
    context.globalState.update('bookList', JSON.stringify(value))
}

export function updateBookCur(context: ExtensionContext, book: Book) {
    updateBookListKV(context, book.fileName, {
        bookPath: book.filePath,
        curPage: book.curPage
    })
}