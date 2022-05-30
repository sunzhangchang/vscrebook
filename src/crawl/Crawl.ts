import axios from "axios"
import * as cheerio from 'cheerio'
import _ = require("lodash")
import { window } from "vscode"
import { myerror, Errors } from "../utils/error"

export abstract class Crawl {
    abstract readonly sourceName: string
    abstract readonly source: string

    abstract getSearchPath(searchKey: string): Promise<string>

    async getSearchPageDOM(searchKey: string): Promise<cheerio.CheerioAPI | null> {
        let res: string
        try {
            const response = await axios.get(await this.getSearchPath(searchKey))

            res = Buffer.from(response.data).toString('utf8')
        } catch (err) {
            window.showErrorMessage((err as Error).message)
            return null
        }

        return cheerio.load(res)
    }

    abstract search(searchKey: string): Promise<SearchBook[]>
    abstract download(menuURL: string): Promise<Buffer | null>
}

export abstract class DownloadTxtCrawl extends Crawl {
    abstract readonly sourceName: string
    abstract readonly source: string

    protected abstract readonly txtURLPrefix: string

    abstract search(searchKey: string): Promise<SearchBook[]>

    abstract getId(menuURL: string): Promise<string>

    async download(menuURL: string): Promise<Buffer | null> {
        const id = await this.getId(menuURL)

        if (_.isUndefined(id)) {
            console.error(menuURL)
            myerror(Errors.getNovelIdFailed)
            return null
        }

        const novelUrl = `${this.txtURLPrefix}${id}`
        window.showInformationMessage('正在下载...')

        return await axios.get(novelUrl)
            .then(response => {
                if (_.isNull(response)) {
                    console.error(novelUrl)
                    myerror(Errors.getNovelFileFailed)
                    return null
                }

                return Buffer.from(response.data)
            })
            .catch(err => {
                console.error(err)
                myerror(Errors.getNovelFileFailed)
                return null
            })
    }
}

export abstract class EachChapterCrawl extends Crawl {
    abstract readonly sourceName: string
    abstract readonly source: string

    protected abstract readonly chaptersSelector: string
    protected abstract readonly chapterTitleSelector: string
    protected abstract readonly contextSelector: string

    abstract search(searchKey: string): Promise<SearchBook[]>

    async getChapters(menuURL: string): Promise<string[]> {
        const response = await axios.get(menuURL)

        const menu = Buffer.from(response.data).toString('utf8')
        const $ = cheerio.load(menu)
        const l = $(this.chaptersSelector).toArray()
        const list: string[] = []
        for (const iter of l) {
            const url = $(iter).attr('href')
            if (_.isUndefined(url)) {
                myerror(Errors.chapterLost)
                continue
            }
            list.push(await this.oneChapter(new URL(url, this.source).href)) // todo : new URL(menuURL).host
        }
        return list
    }

    async oneChapter(url: string): Promise<string> {
        const response = await axios.get(url)
        const $ = cheerio.load(Buffer.from(response.data).toString('utf8'))
        return '========' + $(this.chapterTitleSelector).text() + '========' + $(this.contextSelector).text()
    }

    async download(menuURL: string): Promise<Buffer | null> {
        // debug(menuURL)
        const chapterList = await this.getChapters(menuURL)
        let novel = ''
        for (const iter of chapterList) {
            novel += iter
        }

        return Buffer.from(novel)
    }
}
