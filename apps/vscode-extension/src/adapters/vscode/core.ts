import _ from "lodash"
import { ConfigBase } from "@vscrebook/config"
import type { ConfigSection } from "@vscrebook/config"
import { Book, ReaderService, Showing } from "@vscrebook/core"
import type { BookInfo, PresentationMode, SearchContextResult, Source } from "@vscrebook/core"
import { Cancelled, readFileToUTF8Sync, setExtTo, BookIsNull } from "@vscrebook/utils"
import { Errors } from "@vscrebook/utils/shared"
import { Context } from "./context"
import { join, parse } from "path"
import { getConfig, getShowDebug, getShowError } from "@vscrebook/crawl"
import { Logger } from "./logger"
import { Crawl } from "./crawl"
import { LibraryController } from "./library-controller"
import type { VscrebookWindow } from "./window"

export class Core<Uri extends { fsPath: string }, Configuration extends ConfigSection> {
    private reader: ReaderService
    private logger: Logger
    private crawl: Crawl
    private library: LibraryController<Uri, Configuration>

    constructor(
        private window: VscrebookWindow<Uri>,
        public showing: Showing,
        public config: ConfigBase<Configuration>,
        public context: Context
    ) {
        this.logger = new Logger(
            this.window.info,
            this.window.warn,
            this.window.error
        )

        this.crawl = new Crawl(window.info, this.logger.error)

        getConfig(config)
        getShowError(this.logger.error)
        getShowDebug((msg: string) => {
            if (process.env.mode === 'development') this.logger.info(msg)
        })

        const book = new Book((path) => ({
            text: readFileToUTF8Sync(path),
            name: parse(path).name,
        }))
        this.reader = new ReaderService(book, showing, {
            getBookInfo: (name) => this.booklist[name],
            setBookInfo: (name, value) => this.setBook(name, value),
            getPageSize: () => this.config.pageSize,
            getAutoFlipTime: () => this.config.autoFlipTime,
            showInfo: (message) => this.window.info(message),
            reportError: (error) => this.logger.error(error),
        })
        this.library = new LibraryController(
            this.window,
            this.config,
            this.context,
            this.showing,
            this.logger,
            this.crawl,
            () => BookIsNull.is(this.reader.currentBook) ? undefined : this.reader.currentBook.name,
        )
    }

    get booklist(): Record<string, BookInfo> { return this.context.booklist }
    set booklist(v: Record<string, BookInfo>) { this.context.booklist = v }
    async setBook(key: string, value: BookInfo) { this.context.setBook(key, value) }

    async showNovelText(page?: number): Promise<void> {
        return this.reader.showPage(page)
    }

    toggleBoss(): void {
        this.reader.toggleBoss()
    }

    setPresentationMode(mode: PresentationMode): Promise<void> {
        return this.reader.setPresentationMode(mode)
    }

    async showJump(): Promise<void | Cancelled> {
        if (BookIsNull.is(this.reader.currentBook)) {
            this.logger.error(Errors.bookUndefined)
            return
        }

        const res = Cancelled.from(await this.window.input({
            prompt: '请输入跳转页数: ',
            placeHolder: `跳转页数(默认跳转到当前页: ${this.bookinfo.curPage}, 总页数: ${this.reader.currentBook.totPage})`
        }))

        if (Cancelled.is(res)) {
            return Cancelled.cancelled
        }

        const page = res.trim() === '' ? this.bookinfo.curPage : Number(res)
        if (!Number.isInteger(page) || page < 1) {
            this.window.warn('请输入一个正整数!')
            return
        }

        await this.showNovelText(page)
        this.showing.showBossInterval.clear()
        this.showing.setShowBossInterval()
    }

    autoFlipp(): void {
        this.reader.autoFlip()
    }

    showPrev(): void {
        this.reader.showPrevious()
    }

    showNext(): void {
        this.reader.showNext()
    }

    async showBookList(): Promise<string | Cancelled> {
        return this.library.showBookList()
    }

    async selectBook(): Promise<BookInfo | Cancelled> {
        return this.library.selectBook()
    }

    async rename(bookName: string): Promise<string | Cancelled> {
        return this.library.rename(bookName)
    }

    async addBook(isIpt: boolean, bookPath?: string, bookInfo?: BookInfo): Promise<BookInfo | undefined | Cancelled> {
        return this.library.addBook(isIpt, bookPath, bookInfo)
    }

    async deleteBook(): Promise<undefined | Cancelled> {
        return this.library.deleteBook()
    }

    async showMainMenu(): Promise<BookInfo | undefined | Cancelled> {
        return this.library.showMainMenu()
    }

    async newBook(path?: string, source?: Source): Promise<void> {
        await this.reader.open(path, source)
    }

    async start(): Promise<void> {
        const res = await this.showMainMenu()
        if (Cancelled.is(res)) {
            return
        }
        if (_.isUndefined(res)) {
            this.newBook()
            return
        }

        res.curPage = Math.max(1, Math.ceil(res.curPage * res.pageSize / this.config.pageSize))
        await this.setBook(res.bookName, res)
        await this.newBook(join(this.context.globalStoragePath, setExtTo(res.bookName, 'txt')), res.source)
            .then(async () => {
                await this.showNovelText()
            })
    }

    get bookinfo(): BookInfo {
        return this.reader.bookinfo
    }

    getBook(name: string): BookInfo {
        return this.booklist[name]
    }

    bookSearch(keyword: string): SearchContextResult[] {
        return this.reader.search(keyword)
    }

    async searchContext(): Promise<void> {
        if (BookIsNull.is(this.reader.currentBook)) {
            this.logger.error(Errors.bookUndefined)
            return
        }
        const keyword = await this.window.input({
            placeHolder: '请输入关键字',
        })

        if (_.isUndefined(keyword)) {
            return
        }
        if (keyword.trim().length === 0) {
            this.logger.error(Errors.searchKeyEmpty)
            return
        }

        const list = this.bookSearch(keyword)
        const res = await this.window.pick(list.map((v) => `${v.page}: ${v.txt}`), {
            canPickMany: false,
            matchOnDescription: true,
            matchOnDetail: true,
        })

        if (_.isUndefined(res)) {
            return
        }

        const page = parseInt(res.split(': ')[0])
        await this.showNovelText(page)
        this.window.info('跳转成功!')
    }

    async imexport(): Promise<void> {
        return this.library.imexport()
    }

    async importList(listPath: string): Promise<void> {
        return this.library.importList(listPath)
    }
}
