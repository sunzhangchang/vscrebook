import axios from "axios"
import * as cheerio from 'cheerio'
import _ = require("lodash")
import { error, Errors } from "../utils/error"

export interface Crawl {
    readonly sourceName: string
    readonly source: string
    search(searchKey: string): Promise<SearchBook[] | null>,
    // getDownloadURL()
    download(menuURL: string): Promise<Buffer | null>,
}

export abstract class EachChapterCrawl implements Crawl {
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
        return  '========' + $(this.chapterTitleSelector).text() + '========' + $(this.contextSelector).text()
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
