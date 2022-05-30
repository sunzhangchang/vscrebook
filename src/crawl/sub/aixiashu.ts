import { DownloadTxtCrawl } from "../Crawl"
import _ = require('lodash')
import { getConfig } from "../../core/config"
import axios from "axios"
import { load } from "cheerio"

export class Aixiashu extends DownloadTxtCrawl {
    readonly sourceName: Source = '爱下书小说网'
    readonly source = 'https://www.aixiawx.com/'

    protected readonly txtURLPrefix: string = 'https://txt.aixiawx.com/modules/article/txtarticle.php?id='

    async getSearchPath(searchKey: string): Promise<string> {
        // https://www.aixiawx.com/modules/article/search.php
        const url = new URL('/modules/article/search.php', this.source)
        url.searchParams.append('searchkey', searchKey)
        url.searchParams.sort()
        return url.href
    }

    async search(searchKey: string): Promise<SearchBook[]> {
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
        let t = _.trim(menuURL)
        if (_.endsWith(t, '/')) {
            t = t.substring(0, t.length - 1)
        }
        return _(t).chain().split('/').last().value()
    }
}
