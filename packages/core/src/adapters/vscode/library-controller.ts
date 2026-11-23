import _ from "lodash"
import { ConfigBase } from "@vscrebook/config"
import { Cancelled, copyFileToUTF8Sync, Errors, Memento, readFileToUTF8Sync, setExtTo } from "@vscrebook/utils"
import { join, parse } from "path"
import { readFile, unlink, writeFile } from "fs/promises"
import { Context } from "./context"
import { Logger } from "./logger"
import { Crawl } from "./crawl"
import { Showing } from "../../presentation/showing"

enum Chooses {
    local = '本地书籍',
    online = '网络书籍',
}

enum LibActions {
    select = '选择书籍',
    add = '添加书籍',
    delete = '删除书籍',
    imexport = '导入/导出',
}

enum ImExport {
    importData = '导入书籍列表',
    exportData = '导出书籍列表',
    importSettings = '导入设置',
    exportSettings = '导出设置',
}

export class LibraryController<Uri extends { fsPath: string }, Configuration extends Memento> {
    constructor(
        private window: VscrebookWindow<Uri>,
        public config: ConfigBase<Configuration>,
        private context: Context,
        private showing: Showing,
        private logger: Logger,
        private crawl: Crawl,
        private getCurrentBookName: () => string | undefined,
    ) { }

    get booklist(): Record<string, BookInfo> { return this.context.booklist }
    set booklist(v: Record<string, BookInfo>) { this.context.booklist = v }
    setBook(key: string, value: BookInfo): void { this.context.setBook(key, value) }

    async showBookList(): Promise<string | Cancelled> {
        return Cancelled.from(await this.window.pick(Object.keys(this.booklist), {
            matchOnDescription: true,
        }))
    }

    async selectBook(): Promise<BookInfo | Cancelled> {
        const book = await this.showBookList()
        if (Cancelled.is(book)) return Cancelled.cancelled
        return this.booklist[book]
    }

    private async getAdBook(): Promise<{ bookPath: string; source: Source } | undefined | Cancelled> {
        const choice = Cancelled.from(await this.window.pick(_.values(Chooses), {
            matchOnDescription: true,
        }))

        switch (choice) {
            case Chooses.local: {
                const result = await this.window.open()
                if (_.isUndefined(result)) return Cancelled.cancelled
                return { bookPath: result[0].fsPath, source: '本地' }
            }
            case Chooses.online: {
                let searchKey: string | Cancelled
                while (true) {
                    searchKey = Cancelled.from(await this.window.input({
                        prompt: '请输入搜索关键字: ',
                        placeHolder: '搜索关键字',
                    }))
                    if (Cancelled.is(searchKey)) return
                    if (_.isEmpty(_.trim(searchKey))) {
                        this.logger.error(Errors.searchKeyEmpty)
                    } else {
                        break
                    }
                }

                const list = await this.crawl.search(searchKey)
                if (_.isNil(list)) {
                    this.logger.error(Errors.searchedNothing)
                    return
                }

                const labels = list.map((book) => `${book.书名} - 作者: ${book.作者} - 分类: ${book.分类} - 书源: ${book.书源}`)
                let selected = Cancelled.from(await this.window.pick(labels))
                if (Cancelled.is(selected)) return Cancelled.cancelled

                selected = _.split(selected, ' - ')[0]
                const book = list.find((item) => _.isEqual(item.书名, selected))
                if (_.isUndefined(book)) {
                    this.logger.error(Errors.chooseFaild)
                    return
                }

                this.window.info(`字数: ${book.字数}  -  状态: ${book.状态}\n最新章节: ${book.最新章节}  -  最近更新: ${book.最近更新}\n${book.简介}`)
                const bookPath = await this.crawl.download(book.书源, book.目录链接, this.config.downloadPath, book.书名)
                if (_.isUndefined(bookPath)) {
                    this.logger.error(Errors.downloadPathError)
                    return
                }
                return { bookPath, source: book.书源 }
            }
            default:
                return
        }
    }

    async rename(bookName: string): Promise<string | Cancelled> {
        let newName = bookName
        while (!_.isUndefined(this.booklist[newName])) {
            const result = Cancelled.from(await this.window.input({
                title: '书名重复! 请输入新书名(留空覆盖, 退出取消添加):',
                placeHolder: newName,
            }))
            if (Cancelled.is(result)) {
                this.window.info('取消添加!')
                return Cancelled.cancelled
            }
            if (_.isEmpty(result)) break
            newName = result
        }
        return newName
    }

    async addBook(isImport: boolean, bookPath?: string, bookInfo?: BookInfo): Promise<BookInfo | undefined | Cancelled> {
        let oldPath = bookPath
        let source = bookInfo?.source
        let curPage = bookInfo?.curPage
        let pageSize = bookInfo?.pageSize

        if (_.isUndefined(oldPath)) {
            const selected = await this.getAdBook()
            if (Cancelled.is(selected)) return Cancelled.cancelled
            if (_.isUndefined(selected)) return
            source = selected.source ?? source
            oldPath = selected.bookPath
        }

        source ??= '本地'
        const originalName = parse(oldPath).name
        let bookName = originalName
        if (!isImport) {
            const result = await this.rename(bookName)
            if (Cancelled.is(result)) return Cancelled.cancelled
            bookName = result
        }

        const newPath = join(this.context.globalStoragePath, setExtTo(bookName, 'txt'))
        copyFileToUTF8Sync(oldPath, newPath, (data: string) => _(data)
            .chain()
            .trim()
            .replace(/[\r]+/g, '')
            .replace(/[\t\u3000 ]+/g, ' ')
            .replace(/[\n]+/g, ' ')
            .value())

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

    async deleteBook(): Promise<undefined | Cancelled> {
        const book = await this.showBookList()
        if (Cancelled.is(book)) return Cancelled.cancelled

        const books = this.booklist
        delete books[book]
        this.booklist = books
        await unlink(join(this.context.globalStoragePath, setExtTo(book, 'txt')))
        this.window.info('删除成功')
        this.showing.showBoss()

        const currentBookName = this.getCurrentBookName()
        if (currentBookName && !_.isEqual(currentBookName, book)) return Cancelled.cancelled
    }

    async showMainMenu(): Promise<BookInfo | undefined | Cancelled> {
        const action = Cancelled.from(await this.window.pick(_.values(LibActions), {
            matchOnDescription: true,
        }))
        if (Cancelled.is(action)) return Cancelled.cancelled

        switch (action) {
            case LibActions.select: return this.selectBook()
            case LibActions.add: return this.addBook(false)
            case LibActions.delete: return this.deleteBook()
            case LibActions.imexport:
                await this.imexport()
                return
            default: return
        }
    }

    async imexport(): Promise<void> {
        const action = await this.window.pick(_.values(ImExport), { matchOnDescription: true })
        switch (action) {
            case ImExport.importData: {
                const result = await this.window.open({ canSelectMany: false, filters: { json: ['json'] } })
                if (result) await this.importList(result[0].fsPath)
                break
            }
            case ImExport.exportData: {
                const result = await this.window.save({ filters: { json: ['json'] } })
                if (result) {
                    await writeFile(result.fsPath, JSON.stringify(this.booklist), { encoding: 'utf8' })
                    this.window.info('导出书籍列表成功!')
                }
                break
            }
            case ImExport.importSettings: {
                const result = await this.window.open({ canSelectMany: false, filters: { json: ['json'] } })
                if (result) Object.assign(this.config, JSON.parse(readFileToUTF8Sync(result[0].fsPath)))
                break
            }
            case ImExport.exportSettings: {
                const result = await this.window.save({ filters: { json: ['json'] } })
                if (result) {
                    const settings = {
                        pageSize: this.config.pageSize,
                        downloadPath: this.config.downloadPath,
                        autoFlipTime: this.config.autoFlipTime,
                        displayMode: this.config.displayMode,
                        showMoreInfo: this.config.showMoreInfo,
                        downloadSettings: this.config.downloadSettings,
                        bossTexts: this.config.bossTexts,
                    }
                    await writeFile(result.fsPath, JSON.stringify(settings), 'utf-8')
                    this.window.info('导出设置成功!')
                }
                break
            }
        }
    }

    async importList(listPath: string): Promise<void> {
        const list = JSON.parse(await readFile(listPath, 'utf8')) as Record<string, BookInfo>
        let imported = 0
        let skipped = 0
        let failed = 0

        for (const item of Object.values(list)) {
            const book = parse(item.bookName)
            try {
                const searchedList = await this.crawl.search(book.name)
                const searchedBook = searchedList.find((result) => _.isEqual(book.name, result.书名))
                if (_.isUndefined(searchedBook)) {
                    if (item.source === '本地') {
                        skipped++
                        continue
                    }
                    throw new Error(`导入书籍《${book.name}》失败: 未找到匹配书籍`)
                }

                const bookPath = await this.crawl.download(
                    searchedBook.书源,
                    searchedBook.目录链接,
                    this.config.downloadPath,
                    searchedBook.书名,
                )
                if (_.isUndefined(bookPath)) throw new Error('下载出现错误!')

                await this.addBook(true, setExtTo(bookPath, 'txt'), {
                    ...item,
                    source: searchedBook.书源,
                })
                imported++
            } catch (error) {
                failed++
                console.error((error as Error).message)
                await this.window.warn(`导入书籍《${book.name}》失败!`)
            }
        }
        await this.window.info(`书籍导入完成：成功 ${imported} 本，跳过 ${skipped} 本，失败 ${failed} 本。`)
    }
}
