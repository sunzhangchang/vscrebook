import { ExtensionContext } from "vscode"

let context: ExtensionContext

export function bookListInit(contex: ExtensionContext) {
    context = contex
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
