import type { Memento } from "vscode"
import type { BookInfo } from "@vscrebook/core"
import { Errors } from "@vscrebook/utils/shared"
import { existsSync, mkdirSync } from "fs"

export class Context {
    constructor(
        public globalStoragePath: string,
        public globalState: Memento,
        private error: (err: Errors | string) => void,
    ) {
        if (!existsSync(globalStoragePath)) {
            try {
                mkdirSync(globalStoragePath)
            } catch (e) {
                this.error((e as Error).message)
                this.error(`globalStorage 路径异常，请手动创建!\nPath: ${globalStoragePath}`)
            }
        }
    }

    get booklist(): Record<string, BookInfo> {
        return this.globalState.get<Record<string, BookInfo>>('booklist', {})
    }
    set booklist(v: Record<string, BookInfo>) {
        this.globalState.update('booklist', v)
    }

    setBook(key: string, value: BookInfo): void {
        const books = this.booklist
        books[key] = value
        this.booklist = books
    }
}
