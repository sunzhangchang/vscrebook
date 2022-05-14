import _ = require("lodash")
import * as cheerio from 'cheerio'
import axios from 'axios'
import { EachChapterCrawl } from "../Crawl"
import { getConfig } from "../../core/config"

export class Wbxsw extends EachChapterCrawl {
    readonly sourceName: Source = '58小说网'
    readonly source = 'http://www.wbxsw.com/'

    protected readonly chaptersSelector: string = '#list > dl > dd > a'
    protected readonly chapterTitleSelector: string = '#wrapper > div.content_read > div > div.bookname > h1'
    protected readonly contextSelector: string = '#content'

    async getSearchPath(searchKey: string): Promise<string> {
        let searchPath = (new URL('/search.php', this.source)).href
        let url = new URL(searchPath)
        url.searchParams.append('q', searchKey)
        url.searchParams.sort()
        return url.href
    }

    async search(searchKey: string): Promise<SearchBook[] | null> {
        const $ = await this.getSearchPageDOM(searchKey)

        let searchBooks: SearchBook[] = []
        // debug('!!!!----------------------------------------')
        const list = $('body > div.result-list > div').toArray()
        for (const dl of list) {
            const detail = $(dl).find('div.result-game-item-detail')
            const menu_ = detail.find('h3 > a').attr('href')
            if (_.isUndefined(menu_)) {
                continue
            }
            const menu = new URL(menu_, this.source)
            let status = '未知'
            if (getConfig().statusConfig.wbxsw) {
                const res = await axios.get(menu.href)
                let $$ = cheerio.load(Buffer.from(res.data).toString('utf8'))
                status = _(_($$('#info > p:nth-child(3)').text()).split('：').last() ?? '未知,').split(',').first() ?? '未知'
            }
            searchBooks.push({
                书名: detail.find("h3 > a").attr('title') ?? '可能找不到书名?',
                作者: detail.find("div > p:nth-child(1) > span:nth-child(2)").text(),
                状态: status,
                分类: detail.find("div > p:nth-child(2) > span:nth-child(2)").text(),
                字数: '未知',
                简介: detail.find("p").text(),
                最新章节: detail.find("div > p:nth-child(4) > a").text(),
                最近更新: detail.find("div > p:nth-child(3) > span:nth-child(2)").text(),
                目录链接: menu.href,
                书源: this.sourceName,
            })
        }
        return searchBooks
    }
}
