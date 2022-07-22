import { Crawl } from "../Crawl"
export class Wbxsw extends Crawl {
    readonly sourceName: Source = '58小说网'
    readonly source = 'http://www.wbxsw.com/'
    protected readonly txtURL: string | null = null

    getId(): Promise<string> | null {
        return null
    }

    protected readonly chaptersSelector: string = '#list > dl > dd > a'
    protected readonly chapterTitleSelector: string = '#wrapper > div.content_read > div > div.bookname > h1'
    protected readonly contextSelector: string = '#content'
}
