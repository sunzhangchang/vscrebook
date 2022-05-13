import _ = require("lodash")
import { getBookList } from "./bookList"
import { showBookList } from "./utils"

export async function selectBook(): Promise<BookInfo | undefined> {
    let book: string | undefined = await showBookList()
    let books = getBookList()
    if (!_.isUndefined(book) && book in books) {
        return books[book]
    }
}
