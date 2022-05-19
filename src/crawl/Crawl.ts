import axios from "axios"
import * as cheerio from 'cheerio'
import _ = require("lodash")
import { window } from "vscode"
import { error, Errors } from "../utils/error"

export abstract class Crawl {
    abstract readonly sourceName: string
    abstract readonly source: string

    abstract getSearchPath(searchKey: string): Promise<string>

    async getSearchPageDOM(searchKey: string): Promise<cheerio.CheerioAPI> {
        let res: string
        try {
            let response = await axios.get(await this.getSearchPath(searchKey))

            res = Buffer.from(response.data).toString('utf8')
        } catch (err: any) {
            window.showErrorMessage(err.message)
            throw err
        }

        return cheerio.load(res)
    }

    abstract search(searchKey: string): Promise<SearchBook[] | null>
    abstract download(menuURL: string): Promise<Buffer | null>
}

export abstract class DownloadTxtCrawl extends Crawl {
    abstract readonly sourceName: string
    abstract readonly source: string

    protected abstract readonly txtURLPrefix: string

    abstract search(searchKey: string): Promise<SearchBook[] | null>

    abstract getId(menuURL: string): Promise<string>

    async download(menuURL: string): Promise<Buffer | null> {
        let id = await this.getId(menuURL)

        if (_.isUndefined(id)) {
            console.error(menuURL)
            error(Errors.getNovelIdFailed)
            return null
        }

        let novelUrl = `${this.txtURLPrefix}${id}`
        window.showInformationMessage('正在下载...')

        let response = await axios.get(novelUrl)

        if (_.isNull(response)) {
            console.error(novelUrl)
            error(Errors.getNovelFileFailed)
            return null
        }

        return Buffer.from(response.data)
    }
}

export abstract class EachChapterCrawl extends Crawl {
    abstract readonly sourceName: string
    abstract readonly source: string

    protected abstract readonly chaptersSelector: string
    protected abstract readonly chapterTitleSelector: string
    protected abstract readonly contextSelector: string

    abstract search(searchKey: string): Promise<SearchBook[] | null>

    async getChapters(menuURL: string): Promise<string[]> {
        let response = await axios.get(menuURL)

        let menu = Buffer.from(response.data).toString('utf8')
        let $ = cheerio.load(menu)
        let l = $(this.chaptersSelector).toArray()
        let list: string[] = []
        for (const iter of l) {
            let url = $(iter).attr('href')
            if (_.isUndefined(url)) {
                error(Errors.chapterLost)
                continue
            }
            list.push(await this.oneChapter(new URL(url, this.source).href)) // todo : new URL(menuURL).host
        }
        return list
    }

    async oneChapter(url: string): Promise<string> {
        const response = await axios.get(url)
        let $ = cheerio.load(Buffer.from(response.data).toString('utf8'))
        return '========' + $(this.chapterTitleSelector).text() + '========' + $(this.contextSelector).text()
    }

    async download(menuURL: string): Promise<Buffer | null> {
        // debug(menuURL)
        let chapterList = await this.getChapters(menuURL)
        let novel = ''
        for (const iter of chapterList) {
            novel += iter
        }

        return Buffer.from(novel)
    }
}
