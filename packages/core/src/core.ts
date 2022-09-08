import _ from "lodash"
import { ConfigBase } from "@vscrebook/config"
import { Cancelled, copyFileToUTF8Sync, Errors, Memento, readFileToUTF8Sync, setExtTo, myerror } from "@vscrebook/utils"
import { Context } from "./context"
import { join, parse } from "path"
import { readFile, unlink, writeFile } from "fs/promises"
import { rsDownload, rsSearch, getConfig } from "@vscrebook/crawl"
import { writeFileSync } from "fs"
import { Book } from "./book"

enum Chooses {
    local = '本地书籍',
    online = '网络书籍',
}

enum LibActions {
    select = '选择书籍',
    add = '添加书籍',
    delete = '删除书籍',
    imexport = '导入/导出',
    // settings = '设置',
}

enum ImExport {
    importData = '导入书籍列表',
    exportData = '导出书籍列表',
    importSettings = '导入设置',
    exportSettings = '导出设置',
}

export class Core<Uri extends { fsPath: string }, Configuration extends Memento> {
    private book: Book

    private isBoss = false

    private autoFlipping: NodeJS.Timeout | null = null
    private showBossInterval: NodeJS.Timeout | null = null

    constructor(
        private window: Window<Uri>,
        private showText: ShowText,
        private showBoss: () => void,
        public config: ConfigBase<Configuration>,
        public context: Context
    ) {
        getConfig(config)
        this.book = new Book(this.setBook)
    }

    error(err: Errors | string): void {
        this.window.error(myerror(err))
    }

    get booklist(): Record<string, BookInfo> { return this.context.booklist }
    set booklist(v: Record<string, BookInfo>) { this.context.booklist = v }
    async setBook(key: string, value: BookInfo) { this.context.setBook(key, value) }

    async showBookList(): Promise<string | Cancelled> {
        const books = this.booklist
        return Cancelled.from(await this.window.pick(Object.keys(books), {
            matchOnDescription: true
        }))
    }

    async selectBook(): Promise<BookInfo | Cancelled> {
        const book = await this.showBookList()
        if (Cancelled.is(book)) {
            return Cancelled.cancelled
        }
        const books = this.booklist
        return books[book]
    }

    async search(searchKey: string): Promise<SearchBook[]> {
        this.window.info('正在搜索')
        try {
            const res = (await rsSearch(searchKey)) as {
                results: string
                errors: string
            }
            const errors = JSON.parse(res.errors) as string[]
            console.error(errors)
            errors.forEach(e => this.window.error(e))
            return JSON.parse(res.results)
        } catch (e) {
            console.error(e)
            this.window.error((e as Error).message)
            throw e
        }
    }

    async download(source: string, menuURL: string, dir: string, name: string): Promise<string | undefined> {
        return rsDownload(source, menuURL).then(res => {
            if (_.isUndefined(res)) {
                this.error('下载出现错误')
                return undefined
            }

            const path = join(dir, setExtTo(parse(name).name, 'txt'))

            writeFileSync(path, res, {
                encoding: 'utf-8'
            })

            this.window.info('下载完成!')
            return path
        }).catch(err => {
            this.error((err as Error).message)
            return undefined
        })
    }

    private async getAdBook(): Promise<{
        bookPath: string
        source: Source
    } | undefined> {
        const chos = Cancelled.from(await this.window.pick(_.values(Chooses), {
            matchOnDescription: true,
        }))
        switch (chos) {
            case Chooses.local: {
                return this.window.open().then(res => {
                    if (_.isUndefined(res)) {
                        return
                    }
                    return {
                        bookPath: res[0].fsPath,
                        source: '本地'
                    }
                })
            }

            case Chooses.online: {
                let searchKey
                const true_ = true
                while (true_) {
                    searchKey = await this.window.input({
                        prompt: '请输入搜索关键字: ',
                        placeHolder: '搜索关键字',
                    })
                    if (_.isUndefined(searchKey)) {
                        return
                    }
                    if (_.isEmpty(_.trim(searchKey))) {
                        this.error(Errors.searchKeyEmpty)
                    } else {
                        break
                    }
                }

                const list = await this.search(searchKey ?? '')
                if (_.isNil(list)) {
                    this.error(Errors.searchedNothing)
                    return
                }
                const strlist: string[] = []
                for (const iter of list) {
                    strlist.push(`${iter.书名} - 作者: ${iter.作者} - 分类: ${iter.分类} - 书源: ${iter.书源}`)
                }
                let bookName = await this.window.pick(strlist)

                if (_.isUndefined(bookName)) {
                    return
                }

                bookName = _.split(bookName, ' - ')[0]
                const one = list.find((iter) => _.isEqual(iter.书名, bookName))

                if (_.isUndefined(one)) {
                    this.error(Errors.chooseFaild)
                    return
                }

                this.window.info(`字数: ${one.字数}  -  状态: ${one.状态}\n最新章节: ${one.最新章节}  -  最近更新: ${one.最近更新}\n${one.简介}`)

                const downloadPath = await this.download(one.书源, one.目录链接, this.config.downloadPath, one.书名)

                if (_.isUndefined(downloadPath)) {
                    return undefined
                }

                return {
                    bookPath: downloadPath,
                    source: one.书源,
                }
            }

            default: {
                break
            }
        }
    }

    async addBook(isIpt: boolean, bookPath?: string, bookInfo?: BookInfo): Promise<BookInfo | undefined> {
        let oldPath: string | undefined
        let source: Source | undefined
        let curPage: number | undefined
        let pageSize: number | undefined

        if (!_.isUndefined(bookInfo)) {
            source = bookInfo.source
            curPage = bookInfo.curPage
            pageSize = bookInfo.pageSize
        }
        if (_.isUndefined(bookPath)) {
            const tmp = await this.getAdBook()
            if (!_.isUndefined(tmp)) {
                source = tmp.source ?? source
                oldPath = tmp.bookPath ?? oldPath
            }
        } else {
            oldPath = oldPath ?? bookPath
        }

        if (_.isUndefined(source)) {
            source = '本地'
        }
        if (_.isUndefined(oldPath)) {
            return
        }

        let bookName = parse(oldPath).name
        if (!isIpt) {
            const true_ = true
            while (true_) {
                const bk = this.booklist[bookName]
                // this.window.info(JSON.stringify(this.booklist))
                // this.window.info(JSON.stringify(bk))
                if (_.isUndefined(bk)) {
                    break
                }

                const newBookName = Cancelled.from(await this.window.input({
                    title: '书名重复! 请输入新书名(留空覆盖, 退出取消添加):',
                    placeHolder: bookName,
                }))
                if (Cancelled.is(newBookName)) {
                    this.window.info('取消添加!')
                    return
                }
                if (_.isEmpty(newBookName)) {
                    break
                }
                bookName = newBookName
            }
        }
        const newPath = join(this.context.globalStoragePath, setExtTo(bookName, 'txt'))

        copyFileToUTF8Sync(oldPath, newPath,
            (data: string) => _(data)
                .chain()
                .trim()
                .replace(/[\r]+/g, '')
                .replace(/[\t\u3000 ]+/g, ' ')
                .replace(/[\n]+/g, ' ')
                .value()
        )

        const newBook: BookInfo = {
            bookName,
            pageSize: pageSize ?? this.config.pageSize,
            curPage: curPage ?? 1,
            source,
        }

        this.setBook(bookName, newBook)

        this.window.info('添加成功')
        return newBook
    }

    private async delBookFromList(bookName: string): Promise<void> {
        const books = this.booklist
        delete books[bookName]
        this.booklist = books
    }

    async deleteBook(): Promise<undefined> {
        const book = await this.showBookList()

        if (Cancelled.is(book)) {
            return
        }

        await this.delBookFromList(book)

        const diskFilePath = join(this.context.globalStoragePath, setExtTo(book, 'txt'))
        await unlink(diskFilePath)
        this.window.info('删除成功')
        this.showBoss()
        return
    }

    async showMainMenu(): Promise<BookInfo | undefined | Cancelled> {
        const act = Cancelled.from(await this.window.pick(_.values(LibActions), {
            matchOnDescription: true
        }))
        if (Cancelled.is(act)) {
            return Cancelled.cancelled
        }
        let res: BookInfo | undefined | Cancelled
        switch (act) {
            case LibActions.select: {
                res = await this.selectBook()
                break
            }

            case LibActions.add: {
                res = await this.addBook(false)
                break
            }

            case LibActions.delete: {
                res = await this.deleteBook()
                break
            }

            case LibActions.imexport: {
                await this.imexport()
                res = undefined
                break
            }
        }
        return res
    }

    async newBook(path?: string, source?: Source): Promise<void> {
        const res = await this.book.newBook(this.config.pageSize, path, source)
        if (!res) {
            this.showBoss()
        }
    }

    async showNovelText(page?: number): Promise<void> {
        if (_.isNull(this.book.book)) {
            this.error(Errors.bookUndefined)
            return
        }
        const text = await this.book.getPageText(this.booklist[this.book.book.name].curPage, this.config.pageSize, page)
        this.showText(text)
        this.isBoss = false
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

    get bookinfo(): BookInfo { return this.getBook((this.book.book ?? { name: "" }).name) }

    getBook(name: string): BookInfo {
        return this.booklist[name]
    }

    showPrev(): void {
        if (_.isNull(this.book)) {
            this.error(Errors.bookUndefined)
            return
        }
        this.showNovelText(this.bookinfo.curPage - 1)
    }

    showNext(): void {
        if (_.isNull(this.book)) {
            this.error(Errors.bookUndefined)
            return
        }
        this.showNovelText(this.bookinfo.curPage + 1)
    }

    setShowBossInterval(): void {
        this.showBossInterval = setInterval(() => {
            this.showBoss()
            this.isBoss = true
            this.clearShowBossInterval()
        }, 25 * 1000)
    }

    clearShowBossInterval(): void {
        if (!_.isNull(this.showBossInterval)) {
            clearInterval(this.showBossInterval)
            this.showBossInterval = null
        }
    }

    setAutoFlipInterval(): void {
        this.clearShowBossInterval()
        this.autoFlipping = setInterval(() => this.showNext(), this.config.autoFlipTime)
    }

    clearAutoFlipInterval(): void {
        if (!_.isNull(this.autoFlipping)) {
            clearInterval(this.autoFlipping)
            this.autoFlipping = null
            this.window.info('停止自动翻页')
        }
    }

    toggleBoss(): void {
        if (_.isNull(this.book)) {
            this.isBoss = true
            this.showBoss()
            return
        }
        if (this.isBoss) {
            this.showNovelText()
            this.isBoss = false
            this.clearShowBossInterval()
            if (!_.isNull(this.autoFlipping)) {
                this.clearShowBossInterval()
            } else {
                this.setShowBossInterval()
            }
        } else {
            this.clearAutoFlipInterval()
            this.clearShowBossInterval()
            this.showBoss()
            this.isBoss = true
        }
    }

    showJump(): void {
        if (_.isNull(this.book.book)) {
            this.error(Errors.bookUndefined)
            return
        }
        this.window.input({
            prompt: '请输入跳转页数: ',
            placeHolder: `跳转页数(默认跳转到当前页: ${this.bookinfo.curPage}, 总页数: ${this.book.book.totPage})`
        }).then(val => {
            if (_.isNull(this.book)) {
                this.error(Errors.bookUndefined)
                return
            }
            this.showNovelText(_.isUndefined(val) ? undefined : (+val))
            this.clearShowBossInterval()
            this.setShowBossInterval()
        })
    }

    autoFlipp(): void {
        if (_.isNull(this.book)) {
            this.error(Errors.bookUndefined)
            return
        }
        if (this.isBoss) {
            this.clearAutoFlipInterval()
            return
        }
        if (!_.isNull(this.autoFlipping)) {
            this.clearAutoFlipInterval()
            this.setShowBossInterval()
            return
        } else {
            this.window.info(`开始自动翻页! 当前设置: 每 ${this.config.autoFlipTime} 毫秒(ms)翻页!`)
            this.setAutoFlipInterval()
        }
    }

    refreshAuto(): void {
        this.clearAutoFlipInterval()
        this.clearShowBossInterval()
        this.setShowBossInterval()
    }

    bookSearch(keyword: string): searchCtxResult[] {
        if (_.isNil(this.book.book)) {
            return []
        }
        const list: searchCtxResult[] = []
        const re = new RegExp(keyword, 'g')
        const true_ = true
        while (true_) {
            const res = re.exec(this.book.book.text)
            if (_.isNull(res)) {
                break
            }
            const index = res.index
            const page = Math.ceil(index / this.config.pageSize)
            const txt = this.book.book.text.substring(index - 30, index + 31)
            list.push({
                index,
                page,
                txt,
            })
        }
        return list
    }

    async searchContext(): Promise<void> {
        if (_.isNil(this.book)) {
            this.error(Errors.bookUndefined)
            return
        }
        const keyword = await this.window.input({
            placeHolder: '请输入关键字',
        })

        if (_.isUndefined(keyword)) {
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
        await new Promise(() => {
            this.showNovelText(page)
        }).then(() => {
            this.window.info('跳转成功!')
        })
    }

    async imexport(): Promise<void> {
        const act = await this.window.pick(_.values(ImExport), {
            matchOnDescription: true
        })
        switch (act) {
            case ImExport.importData: {
                const res = await this.window.open({
                    canSelectMany: false,
                    filters: {
                        'json': ['json']
                    }
                })
                if (_.isUndefined(res)) {
                    return
                }
                const listPath = res[0].fsPath
                await this.importList(listPath)
                break
            }

            case ImExport.exportData: {
                const res = await this.window.save({
                    filters: {
                        'json': ['json']
                    }
                })
                if (_.isUndefined(res)) {
                    return
                }
                await (
                    writeFile(res.fsPath, JSON.stringify(this.booklist), {
                        encoding: 'utf8'
                    }).then(() => {
                        this.window.info('导出书籍列表成功!')
                    })
                )
                break
            }

            case ImExport.importSettings: {
                const res = await this.window.open({
                    canSelectMany: false,
                    filters: {
                        'json': ['json']
                    }
                })
                if (_.isUndefined(res)) {
                    return
                }
                const path = res[0].fsPath
                const settings = readFileToUTF8Sync(path)
                this.config = JSON.parse(settings)
                break
            }

            case ImExport.exportSettings: {
                const res = await this.window.save({
                    filters: {
                        'json': ['json']
                    }
                })
                if (_.isUndefined(res)) {
                    return
                }
                const path = res.fsPath
                await (
                    writeFile(path, JSON.stringify(this.config), 'utf-8')
                        .then(() => {
                            this.window.info('导出设置成功!')
                        })
                )
                break
            }

            default:
                break
        }
    }

    async importList(listPath: string): Promise<void> {
        const list = JSON.parse(await readFile(listPath, 'utf8')) as Record<string, BookInfo>

        _.forIn(list, async (v) => {
            const book = parse(v.bookName)

            await (
                this.search(book.name)
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

                        this.download(searchedBook.书源, searchedBook.目录链接, this.config.downloadPath, searchedBook.书名)
                            .then((bookPath) => {
                                if (_.isUndefined(bookPath)) {
                                    throw new Error("下载出现错误!")
                                }
                                this.addBook(true, setExtTo(bookPath, 'txt'), {
                                    ...v,
                                    source: searchedBook.书源,
                                }).then(() => {
                                    this.window.info(`导入书籍 《${book.name}》 成功!`)
                                })
                            })
                            .catch(err => {
                                console.error((err as Error).message)
                            })
                    })
                    .catch((err) => {
                        this.error(Errors.importSearchError)
                        console.error((err as Error).message)
                    })
            )
        })
        this.window.info('书籍导入完成!')
    }
}
