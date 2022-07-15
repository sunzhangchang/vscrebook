import _ from "lodash"
import * as cheerio from 'cheerio'
import axios from 'axios'
import { getConfig } from "../../core/config"
import { Crawl } from "../Crawl"

export class Wbxsw extends Crawl {
    readonly sourceName: Source = '58小说网'
    readonly source = 'http://www.wbxsw.com/'
    readonly searchPath: string = 'https://www.wbxsw.com/search.php?keyword=%s'
    protected readonly txtURL: string | null = null

    getId(): Promise<string> | null {
        return null
    }

    protected readonly chaptersSelector: string = '#list > dl > dd > a'
    protected readonly chapterTitleSelector: string = '#wrapper > div.content_read > div > div.bookname > h1'
    protected readonly contextSelector: string = '#content'

    async searchDetail(searchKey: string): Promise<SearchBook[]> {
        const $ = await this.getSearchPageDOM(searchKey)

        if (_.isNull($)) {
            return []
        }

        const searchBooks: SearchBook[] = []
        const list = $('div.result-item')
        for (const dl of list) {
            const detail = $(dl).find('div.result-game-item-detail')
            const menu_ = detail.find('h3:nth-child(1) > a:nth-child(1)').attr('href')
            if (_.isUndefined(menu_)) {
                continue
            }
            const menu = new URL(menu_, this.source).href
            let status = '未知'
            if (getConfig().showMoreInfo.wbxsw) {
                const res = await axios.get(menu)
                const $$ = cheerio.load(Buffer.from(res.data).toString('utf8'))
                status = _(_($$('#info > p:nth-child(3)').text()).split('：').last() ?? '未知,').split(',').first() ?? '未知'
            }
            searchBooks.push({
                书名: detail.find("h3:nth-child(1) > a:nth-child(1)").attr('title') ?? 'never',
                作者: detail.find("div:nth-child(3) > p:nth-child(1) > span:nth-child(2)").text(),
                状态: status,
                分类: detail.find("div:nth-child(3) > p:nth-child(2) > span:nth-child(2)").text(),
                字数: '未知',
                简介: detail.find("p:nth-child(2)").text(),
                最新章节: detail.find("div:nth-child(3) > p:nth-child(4) > a:nth-child(2)").text(),
                最近更新: detail.find("div:nth-child(3) > p:nth-child(3) > span:nth-child(2)").text(),
                目录链接: menu,
                书源: this.sourceName,
            })
        }
        return searchBooks
    }
}
