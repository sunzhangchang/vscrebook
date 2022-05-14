export interface Crawl {
    readonly sourceName: string
    readonly source: string
    search(searchKey: string): Promise<SearchBook[] | null>,
    // getDownloadURL()
    download(menuURL: string): Promise<Buffer | null>,
}
