import _ from 'lodash'
import { Crawl } from '../Crawl'

export class Caimoge extends Crawl {
    readonly sourceName: Source = '采墨阁'
    readonly source = 'https://www.caimoge.net/'
    protected readonly txtURL = 'https://www.caimoge.net/api/txt_down.php?articleid=%s'

    async getId(menuURL: string): Promise<string> {
        return _(menuURL).chain().trim().split('/').last().split('.').first().value()
    }

    protected readonly chaptersSelector: string = '#readerlist > ul > li > a'
    protected readonly chapterTitleSelector: string = '#center > div.title > h1 > em'
    protected readonly contextSelector: string = '#content'
}
