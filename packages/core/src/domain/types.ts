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

export type SearchBook = {
    书名: string
    作者: string
    状态: string
    分类: string
    字数: string
    简介: string
    最新章节: string
    最近更新: string
    目录链接: string
    书源: Source
}
