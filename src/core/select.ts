import _ from "lodash"
import { getBookList } from "./bookList"
import { showBookList } from "./utils"

export async function selectBook(): Promise<BookInfo | undefined> {
    const book: string | undefined = await showBookList()
    const books = getBookList()
    if (!_.isUndefined(book) && book in books) {
        return books[book]
    }
}
