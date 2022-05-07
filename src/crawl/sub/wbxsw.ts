import _ = require("lodash")
import * as cheerio from 'cheerio'
import { error, Errors } from "../../utils/error"
import axios from 'axios'
// import querystring = require('querystring')
import { window } from "vscode"
import { Crawl } from "../inter"
import { getConfig } from "../../utils/config"

export class Wbxsw implements Crawl {
    sourceName: Source = '58小说网'
    source = 'http://www.wbxsw.com/'

    async search(searchKey: string): Promise<SearchBook[] | null> {
        let searchPath = new URL('/search.php', this.source).href
        let url = new URL(searchPath)
        url.searchParams.append('q', searchKey)
        url.searchParams.sort()

        // debug(url.href)

        let res: string
        try {
            let response = await axios({
                url: url.href,
                // querystring.stringify({searchKey})
            })

            res = Buffer.from(response.data).toString('utf8')
        } catch (err: any) {
            window.showErrorMessage(err.message)
            throw err
        }

        let searchBooks: SearchBook[] = []

        const $ = cheerio.load(res)
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

    async getChapters(menuURL: string, asSelector: string): Promise<string[]> {
        let response = await axios.get(menuURL)

        let menu = Buffer.from(response.data).toString('utf8')
        let $ = cheerio.load(menu)
        let l = $(asSelector).toArray()
        let list: string[] = []
        for (const iter of l) {
            let url = $(iter).attr('href')
            if (_.isUndefined(url)) {
                error(Errors.chapterLost)
                continue
            }
            // debug(url)
            list.push(await this.oneChapter(new URL(url, this.source).href)) // todo : new URL(menuURL).host
        }
        return list
    }

    async oneChapter(url: string): Promise<string> {
        const response = await axios.get(url)
        let $ = cheerio.load(Buffer.from(response.data).toString('utf8'))
        return  '========' + $('#wrapper > div.content_read > div > div.bookname > h1').text() + '========' + $('#content').text()
    }

    async download(menuURL: string): Promise<Buffer | null> {
        // debug(menuURL)
        let chapterList = await this.getChapters(menuURL, '#list > dl > dd > a')
        let novel = ''
        for (const iter of chapterList) {
            novel += iter
        }

        return Buffer.from(novel)
    }
}
