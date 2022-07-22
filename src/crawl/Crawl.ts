import axios from "axios"
import * as cheerio from 'cheerio'
import _ from "lodash"
import { format } from "util"
import { window } from "vscode"
import { getConfig } from "../core/config"
import { myerror, Errors } from "../utils/error"

export abstract class Crawl {
    abstract readonly sourceName: string
    abstract readonly source: string
    protected abstract readonly txtURL: string | null

    abstract getId(menuURL: string): Promise<string> | null

    async txt(menuURL: string): Promise<Buffer | null> {
        const st = getConfig().downloadSettings[this.sourceName]
        if (_.isEqual(st, 'disable') || _.isEqual(st, 'chaptersOnly') || _.isNull(this.txtURL)) {
            throw new Error()
        }

        const id = await this.getId(menuURL)

        if (_.isNull(id)) {
            throw new Error('id not found')
        }

        if (_.isUndefined(id)) {
            console.error(menuURL)
            myerror(Errors.getNovelIdFailed)
            return null
        }

        const novelUrl = format(this.txtURL, id)
        window.showInformationMessage('正在下载...')

        return axios.get(novelUrl)
            .then(response => {
                if (_.isNull(response)) {
                    throw new Error()
                }

                return Buffer.from(response.data)
            })
            .catch(() => {
                throw new Error()
            })
    }

    protected abstract readonly chaptersSelector: string
    protected abstract readonly chapterTitleSelector: string
    protected abstract readonly contextSelector: string

    async getChapters(menuURL: string): Promise<string[]> {
        const response = await axios.get(menuURL)

        const menu = Buffer.from(response.data).toString('utf8')
        const $ = cheerio.load(menu)
        const l = $(this.chaptersSelector).toArray()
        const list: Promise<string>[] = []
        for (const e of l) {
            const url = $(e).attr('href')
            if (_.isUndefined(url)) {
                myerror(Errors.chapterLost)
                continue
            }
            list.push(this.oneChapter(new URL(url, this.source).href)) // todo : new URL(menuURL).host
        }
        return Promise.all(list)
    }

    async oneChapter(url: string): Promise<string> {
        const response = await axios.get(url)
        const $ = cheerio.load(Buffer.from(response.data).toString('utf8'))
        return '========' + $(this.chapterTitleSelector).text() + '========' + $(this.contextSelector).text()
    }

    async chapters(menuURL: string): Promise<Buffer | null> {
        const st = getConfig().downloadSettings[this.sourceName]
        if (_.isEqual(st, 'disable') || _.isEqual(st, 'txtOnly')) {
            throw new Error()
        }

        const chapterList = await this.getChapters(menuURL)
        const novel = chapterList.join('    ')

        return Buffer.from(novel)
    }

    async download(menuURL: string): Promise<Buffer | null> {
        return this.txt(menuURL)
            .then(res => res)
            .catch(() => this.chapters(menuURL))
    }
}
