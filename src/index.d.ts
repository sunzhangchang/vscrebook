declare type DisplayMode =
    | 'statusBar'
    | 'showInformation'

declare type StatusConfig = {
    caimoge: boolean
    wbxsw: boolean
}

declare type ConfigType = ConfigBase<number, string, number, DisplayMode, StatusConfig>
// {
// 	pageSize: number
// 	downloadPath: string
// 	autoFlipTime: number
// 	displayMode: DisplayMode
// 	statusConfig: StatusConfig
// }

declare type Source =
    | '本地'
    | '采墨阁'
    | '58小说网'

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
    default: | number | string | object
    type: | 'number' | 'string' | 'object'
    form: | 'input' | 'choose'
    choices?: string[]
}

declare type ConfigSetObj = ConfigBaseOne<ConfigSet>

declare type ConfigBaseOne<T> = {
    pageSize: T
    downloadPath: T
    autoFlipTime: T
    displayMode: T
    statusConfig: T
}

declare type ConfigBase<T, U, V, W, X> = {
    pageSize: T
    downloadPath: U
    autoFlipTime: V
    displayMode: W
    statusConfig: X
}
