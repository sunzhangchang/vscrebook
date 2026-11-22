import { BookIsNull, Errors } from "@vscrebook/utils"
import { Book, BookDocument } from "../domain/book"
import type { BookInfo, SearchContextResult, Source } from "../domain/types"
import { PresentationMode, Showing } from "../presentation/showing"

export interface ReaderDependencies {
    getBookInfo(name: string): BookInfo | undefined
    setBookInfo(name: string, value: BookInfo): Promise<void>
    getPageSize(): number
    getAutoFlipTime(): number
    showInfo(message: string): unknown
    reportError(error: Errors | string): void
}

export class ReaderService {
    constructor(
        private book: Book,
        private showing: Showing,
        private dependencies: ReaderDependencies,
    ) {
    }

    get currentBook(): BookDocument | BookIsNull {
        return this.book.book
    }

    get bookinfo(): BookInfo {
        const book = this.currentBook
        return this.dependencies.getBookInfo(BookIsNull.is(book) ? "" : book.name) as BookInfo
    }

    async open(path?: string, source?: Source): Promise<boolean> {
        const opened = await this.book.newBook(this.dependencies.getPageSize(), path, source)
        if (!opened) this.showing.showBoss()
        return opened
    }

    setPresentationMode(mode: PresentationMode): Promise<void> {
        return this.showing.setMode(mode)
    }

    async showPage(page?: number): Promise<void> {
        const book = this.currentBook
        if (BookIsNull.is(book)) {
            this.dependencies.reportError(Errors.bookUndefined)
            return
        }

        const pageSize = this.dependencies.getPageSize()
        const result = await this.book.getPageText(
            this.dependencies.getBookInfo(book.name)!.curPage,
            pageSize,
            page,
        )
        if (BookIsNull.is(result)) return

        await this.dependencies.setBookInfo(book.name, {
            bookName: book.name,
            pageSize,
            curPage: result.page,
            source: book.source,
        })
        this.showing.showText(result.text)
        this.showing.isBoss = false
    }

    toggleBoss(): void {
        if (BookIsNull.is(this.currentBook)) {
            this.showing.showBoss()
            return
        }

        if (this.showing.isBoss) {
            void this.showPage()
            this.showing.showBossInterval.clear()
            this.showing.setShowBossInterval()
            return
        }

        this.showing.showBoss()
        this.showing.autoFlipping.clear()
        this.showing.showBossInterval.clear()
    }

    autoFlip(): void {
        if (BookIsNull.is(this.currentBook)) {
            this.dependencies.reportError(Errors.bookUndefined)
            return
        }
        if (this.showing.isBoss) {
            this.showing.autoFlipping.clear()
            return
        }
        if (this.showing.autoFlipping.has()) {
            this.showing.autoFlipping.clear()
            this.showing.setShowBossInterval()
            return
        }

        const interval = this.dependencies.getAutoFlipTime()
        this.dependencies.showInfo(`开始自动翻页! 当前设置: 每 ${interval} 毫秒(ms)翻页!`)
        this.showing.setAutoFlipInterval(() => { void this.showPage(this.bookinfo.curPage + 1) }, interval)
    }

    showPrevious(): void {
        if (BookIsNull.is(this.currentBook)) {
            this.dependencies.reportError(Errors.bookUndefined)
            return
        }
        void this.showPage(this.bookinfo.curPage - 1)
    }

    showNext(): void {
        if (BookIsNull.is(this.currentBook)) {
            this.dependencies.reportError(Errors.bookUndefined)
            return
        }
        void this.showPage(this.bookinfo.curPage + 1)
    }

    search(keyword: string): SearchContextResult[] {
        const book = this.currentBook
        if (BookIsNull.is(book) || keyword.length === 0) return []

        const pageSize = this.dependencies.getPageSize()
        const matches: SearchContextResult[] = []
        let fromIndex = 0
        while (fromIndex < book.text.length) {
            const index = book.text.indexOf(keyword, fromIndex)
            if (index === -1) break
            matches.push({
                index,
                page: Math.floor(index / pageSize) + 1,
                txt: book.text.substring(index - 30, index + 31),
            })
            fromIndex = index + keyword.length
        }
        return matches
    }
}
