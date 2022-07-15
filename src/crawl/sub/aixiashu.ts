import _ from 'lodash'
import { getConfig } from "../../core/config"
import axios from "axios"
import { load } from "cheerio"
import { Crawl } from '../Crawl'

export class Aixiashu extends Crawl {
    readonly sourceName: Source = '爱下书小说网'
    readonly source = 'https://www.aixiawx.com/'
    readonly searchPath: string = 'https://www.aixiaxsw.com/modules/article/search.php?searchkey=%s'
    protected readonly txtURL: string = 'https://txt.aixiawx.com/modules/article/txtarticle.php?id=%s'

    async searchDetail(searchKey: string): Promise<SearchBook[]> {
        const $ = await this.getSearchPageDOM(searchKey)

        if (_.isNull($)) {
            return []
        }

        const searchBooks: SearchBook[] = []
        const list = $('#content > table > tbody > tr:nth-child(n+2)').toArray()
        for (const dl of list) {
            const detail = $(dl)
            const menu_ = detail.find('td:nth-child(1) > a').attr('href')
            if (_.isUndefined(menu_)) {
                continue
            }
            const menu = new URL(menu_, this.source).href
            let intro = '未知'
            let cate = '未知'
            if (getConfig().showMoreInfo.aixiashu) {
                const res = await axios.get(menu)
                const $$ = load(Buffer.from(res.data).toString('utf8'))
                intro = $$('#intro > p').text()
                cate = $$('#wrapper > div:nth-child(6) > div.con_top > a:nth-child(3)').text()
            }
            searchBooks.push({
                书名: detail.find('td:nth-child(1) > a').text(),
                作者: detail.find('td:nth-child(3)').text(),
                状态: detail.find('td:nth-child(6)').text(),
                分类: cate,
                字数: detail.find('td:nth-child(4)').text(),
                简介: intro,
                最新章节: detail.find('td:nth-child(2) > a').text(),
                最近更新: detail.find('td:nth-child(5)').text(),
                目录链接: menu,
                书源: this.sourceName
            })
        }
        return searchBooks
    }

    async getId(menuURL: string): Promise<string> {
        // e.g. https://www.aixiawx.com/91/91966/
        return (menuURL.match(/.+?\/([0-9]+?)/) ?? [])[1]
    }

    protected readonly chaptersSelector: string = '#list > dl > dd > a'
    protected readonly chapterTitleSelector: string = '#wrapper > div.content_read > div > div.bookname > h1'
    protected readonly contextSelector: string = '#content'
}
