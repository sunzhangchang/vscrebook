import { Crawl } from '../Crawl'

export class Aixiashu extends Crawl {
    readonly sourceName: Source = '爱下书小说网'
    readonly source = 'https://www.aixiaxsw.com/'
    protected readonly txtURL: string = 'https://txt.aixiawx.com/modules/article/txtarticle.php?id=%s'

    async getId(menuURL: string): Promise<string> {
        // e.g. https://www.aixiawx.com/91/91966/
        return (menuURL.match(/.+?\/([0-9]+?)/) ?? [])[1]
    }

    protected readonly chaptersSelector: string = '#list > dl > dd > a'
    protected readonly chapterTitleSelector: string = '#wrapper > div.content_read > div > div.bookname > h1'
    protected readonly contextSelector: string = '#content'
}
