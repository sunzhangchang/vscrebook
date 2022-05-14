import { DownloadTxtCrawl } from "../Crawl"
import _ = require('lodash')

export class Aixiashu extends DownloadTxtCrawl {
    readonly sourceName: Source = '爱下书小说网'
    readonly source = 'https://www.aixiawx.com/'

    protected txtURLPrefix: string = 'https://txt.aixiawx.com/modules/article/txtarticle.php?id='

    async getSearchPath(searchKey: string): Promise<string> {
        // https://www.aixiawx.com/modules/article/search.php
        let url = new URL('/modules/article/search.php', this.source)
        url.searchParams.append('searchkey', searchKey)
        url.searchParams.sort()
        return url.href
    }

    async search(searchKey: string): Promise<SearchBook[] | null> {
        const $ = await this.getSearchPageDOM(searchKey)

        let searchBooks: SearchBook[] = []
        $('#content > table > tbody > tr:nth-child(n+2)').each((i, dl) => {
            searchBooks.push({
                书名: $(dl).find('td:nth-child(1) > a').text(),
                作者: $(dl).find("dd:nth-child(3) > span:nth-child(1) > a:nth-child(1)").text(),
                状态: $(dl).find("dd:nth-child(3) > span:nth-child(2)").text(),
                分类: $(dl).find("dd:nth-child(3) > span:nth-child(3)").text(),
                字数: $(dl).find("dd:nth-child(3) > span:nth-child(4)").text(),
                简介: $(dl).find("dd:nth-child(4)").text(),
                最新章节: $(dl).find("dd:nth-child(5) > a:nth-child(1)").text(),
                最近更新: $(dl).find("dd:nth-child(5) > span:nth-child(2)").text(),
                目录链接: new URL($(dl).find('td:nth-child(1) > a').attr('href') ?? 'nothing', this.source).href,
                书源: this.sourceName
            })
        })
        return searchBooks
    }

    async getId(menuURL: string): Promise<string> {
        // e.g. https://www.aixiawx.com/91/91966/
        let t = _.trim(menuURL)
        if (_.endsWith(t, '/')) {
            t = t.substring(0, t.length - 2)
        }
        return _(t).chain().split('/').last().split('.').first().value()
    }
}
