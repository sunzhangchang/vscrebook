declare type DisplayMode =
    | 'statusBar'
    | 'showInformation'

declare type ShowMoreInfo = {
    caimoge: boolean
    wbxsw: boolean
    aixiashu: boolean
}

declare type ConfigType = ConfigBase<number, string, number, DisplayMode, ShowMoreInfo>
// {
// 	pageSize: number
// 	downloadPath: string
// 	autoFlipTime: number
// 	displayMode: DisplayMode
// 	showMoreInfo: ShowMoreInfo
// }

declare type Source =
    | '本地'
    | '采墨阁'
    | '58小说网'
    | '爱下书小说网'

declare type BookInfo = {
    bookName: string
    pageSize: number
    curPage: number
    source: Source
}

declare type SearchBook = {
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

declare type ConfigSet = {
    name: string
    desc: string
    default: | number | string | obj
    type: | 'number' | 'string' | 'object'
    form: | 'input' | 'choose'
    choices?: string[]
}

declare type ConfigSetObj = ConfigBaseOne<ConfigSet>

declare type ConfigBaseOne<T> = ConfigBase<T, T, T, T, T>

declare type ConfigBase<T, U, V, W, X> = {
    pageSize: T
    downloadPath: U
    autoFlipTime: V
    displayMode: W
    showMoreInfo: X
}

declare type obj = Record<string, unknown>

declare type searchCtxResult = {
    index: number
    page: number
    txt: string
}
