import _ = require("lodash")
import * as cheerio from 'cheerio'
import { error, Errors } from "../../utils/error"
import { posix } from "path"
import axios from 'axios'
// import querystring = require('querystring')
import { window } from "vscode"
import { Crawl } from "../inter"

export const caimoge: Crawl =  {
    sourceName: '采墨阁',
    source: 'https://www.caimoge.net/',

    async search(searchKey: string): Promise<SearchBook[] | null> {
        let searchPath = this.source + 'search/'
        // console.log(searchPath)
        let url = new URL(searchPath)
        url.searchParams.append('searchkey', searchKey)
        url.searchParams.sort()

        let res: string
        try {
            let response = await axios({
                url: url.href,
                // querystring.stringify({searchKey})
            })

            res = Buffer.from(response.data).toString('utf8')
            console.log(res)
        } catch (err: any) {
            window.showErrorMessage(err.message)
            throw err
        }
        // console.log(res)

        let searchBooks: SearchBook[] = []

        const $ = cheerio.load(res)
        // console.log('!!!!----------------------------------------')
        $('#sitembox dl').each((i, dl) => {
            searchBooks.push({
                书名: $(dl).find("dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)").text(),
                作者: $(dl).find("dd:nth-child(3) > span:nth-child(1) > a:nth-child(1)").text(),
                状态: $(dl).find("dd:nth-child(3) > span:nth-child(2)").text(),
                分类: $(dl).find("dd:nth-child(3) > span:nth-child(3)").text(),
                字数: $(dl).find("dd:nth-child(3) > span:nth-child(4)").text(),
                简介: $(dl).find("dd:nth-child(4)").text(),
                最新章节: $(dl).find("dd:nth-child(5) > a:nth-child(1)").text(),
                最近更新: $(dl).find("dd:nth-child(5) > span:nth-child(2)").text(),
                目录链接: posix.join(searchPath, $(dl).find('dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)').attr('href') ?? 'nothing'),
                书源: this.sourceName
            })
        })
        // console.log('++++++++++++++++++++++++++++++++++++++++++++++')
        return searchBooks
    },

    async download(menuURL: string): Promise<Buffer | null> {
        let id = _.first(_.split(_.last(_.split(_.trim(menuURL), '/')), '.'))

        if (_.isUndefined(id)) {
            console.error(menuURL)
            error(Errors.getNovelIdFailed)
            return null
        }

        let novelUrl = 'https://down.caimoge.net/modules/article/txtarticle.php?id=' + id

        let response = await axios.get(novelUrl)

        if (_.isNull(response)) {
            console.error(novelUrl)
            error(Errors.getNovelFileFailed)
            return null
        }

        return Buffer.from(response.data)
    }
}
