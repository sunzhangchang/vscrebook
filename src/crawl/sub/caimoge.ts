import _ = require("lodash")
import { fetch } from "../fetch"
import * as cheerio from 'cheerio'
import path = require("path")
import { error, Errors } from "../../utils/error"

async function search(searchKey: string) {
    let base = new URL('https://www.caimoge.net/search')
    let url = new URL(base.href)
    url.searchParams.append('searchkey', searchKey)
    url.searchParams.sort()

    let response = await fetch(url.href)

    if (_.isNull(response)) {
        return null
    }

    let res = Buffer.from(response.data).toString('utf8')
    // console.log(res)

    let searchBooks: SearchBook[] = []

    const $ = cheerio.load(res)
    // console.log('!!!!----------------------------------------')
    $('#sitembox dl').each((i, dl) => {
        // console.log(dl)
        let lnk = path.posix.join(base.href, $(dl).find('dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)').attr('href') ?? 'nothing')
        // console.log(lnk)
        searchBooks.push({
            书名: $(dl)
                .find("dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)")
                .text(),
            作者: $(dl)
                .find("dd:nth-child(3) > span:nth-child(1) > a:nth-child(1)")
                .text(),
            状态: $(dl)
                .find("dd:nth-child(3) > span:nth-child(2)")
                .text(),
            分类: $(dl)
                .find("dd:nth-child(3) > span:nth-child(3)")
                .text(),
            字数: $(dl)
                .find("dd:nth-child(3) > span:nth-child(4)")
                .text(),
            简介: $(dl).find("dd:nth-child(4)").text(),
            最新章节: $(dl)
                .find("dd:nth-child(5) > a:nth-child(1)")
                .text(),
            最近更新: $(dl)
                .find("dd:nth-child(5) > span:nth-child(2)")
                .text(),
            目录链接: lnk,
        })
    })
    // console.log('++++++++++++++++++++++++++++++++++++++++++++++')
    return searchBooks
}

async function download(url: string) {
    let id = _.first(_.split(_.last(_.split(_.trim(url), '/')), '.'))

    if (_.isUndefined(id)) {
        console.error(url)
        error(Errors.getNovelIdFailed)
        return null
    }

    let novelUrl = 'https://down.caimoge.net/modules/article/txtarticle.php?id=' + id

    let response = await fetch(novelUrl)

    if (_.isNull(response)) {
        console.error(novelUrl)
        error(Errors.getNovelFileFailed)
        return null
    }

    return Buffer.from(response.data)
}

export const caimoge = {
    search,
    download,
}