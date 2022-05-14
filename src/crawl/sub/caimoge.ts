import { DownloadTxtCrawl } from "../Crawl"
import _ = require('lodash')
import { getConfig } from "../../core/config"

export class Caimoge extends DownloadTxtCrawl {
    readonly sourceName: Source = '采墨阁'
    readonly source = 'https://www.caimoge.net/'

    protected txtURLPrefix: string = 'https://www.caimoge.net/api/txt_down.php?articleid='

    async getSearchPath(searchKey: string): Promise<string> {
        let url = new URL('/search/', this.source)
        url.searchParams.append('searchkey', searchKey)
        url.searchParams.sort()
        return url.href
    }

    async search(searchKey: string): Promise<SearchBook[] | null> {
        const $ = await this.getSearchPageDOM(searchKey)

        let searchBooks: SearchBook[] = []
        $('#sitembox dl').each((i, dl) => {
            searchBooks.push({
                书名: $(dl).find("dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)").text(),
                作者: $(dl).find("dd:nth-child(3) > span:nth-child(1) > a:nth-child(1)").text(),
                状态: ((getConfig().showMoreInfo.caimoge) ? ($(dl).find("dd:nth-child(3) > span:nth-child(2)").text()) : ('未知')),
                分类: $(dl).find("dd:nth-child(3) > span:nth-child(3)").text(),
                字数: $(dl).find("dd:nth-child(3) > span:nth-child(4)").text(),
                简介: $(dl).find("dd:nth-child(4)").text(),
                最新章节: $(dl).find("dd:nth-child(5) > a:nth-child(1)").text(),
                最近更新: $(dl).find("dd:nth-child(5) > span:nth-child(2)").text(),
                目录链接: new URL($(dl).find('dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)').attr('href') ?? 'nothing', this.source).href,
                书源: this.sourceName
            })
        })
        return searchBooks
    }

    async getId(menuURL: string): Promise<string> {
        return _(menuURL).chain().trim().split('/').last().split('.').first().value()
    }
}
