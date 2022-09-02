import { Memento } from "@vscrebook/utils"

export class Context {
    readonly globalStoragePath: string
    readonly globalState: Memento

    constructor(globalStoragePath: string, globalState: Memento) {
        this.globalStoragePath = globalStoragePath
        this.globalState = globalState
    }

    get booklist(): Record<string, BookInfo> {
        return this.globalState.get<Record<string, BookInfo>>('booklist', {})
    }
    set booklist(v: Record<string, BookInfo>) {
        this.globalState.update<Record<string, BookInfo>>('booklist', v)
    }

    setBook(key: string, value: BookInfo): void {
        const books = this.booklist
        books[key] = value
        this.booklist = books
    }
}
