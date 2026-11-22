export type Source =
    | '本地'
    | '采墨阁'
    | '58小说网'
    | '爱下书小说网'
    | '醉读'

export type BookInfo = {
    bookName: string
    pageSize: number
    curPage: number
    source: Source
}

export type SearchContextResult = {
    index: number
    page: number
    txt: string
}
