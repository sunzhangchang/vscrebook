import { getBookList } from "../utils/bookList"
import { showBookList } from "./utils"

export async function selectBook(): Promise<BookInfo | undefined> {
    let book: string | undefined = await showBookList()
    let books = getBookList()
    if (book && book in books) {
        return books[book]
    }
}
