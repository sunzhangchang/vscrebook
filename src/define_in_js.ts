import _ from "lodash"
import { ExtConfig, getConfig } from "./core/config"
import { mydebug } from "./utils/debug"

// export class ShowMoreInfo {
//     public caimoge = false
//     public wbxsw = false
//     public aixiashu = false
// }

// export type DownloadSettings = Record<string, 'disable' | 'txtOnly' | 'chaptersOnly' | 'txt & chapters'>

// declare type Source =
//     | '本地'
//     | '采墨阁'
//     | '58小说网'
//     | '爱下书小说网'

// declare type BookInfo = {
//     bookName: string
//     pageSize: number
//     curPage: number
//     source: Source
// }

// declare type SearchBook = {
//     书名: string
//     作者: string
//     状态: string
//     分类: string
//     字数: string
//     简介: string
//     最新章节: string
//     最近更新: string
//     目录链接: string
//     书源: Source
// }

// declare type obj = Record<string, unknown>

// eslint-disable-next-line @typescript-eslint/naming-convention
export function get_config() {
    return {
        showMoreInfo: getConfig().showMoreInfo,
        downThreadAmount: getConfig().downThreadAmount,
        downloadSettings: getConfig().downloadSettings,
    }
}
