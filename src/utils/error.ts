import { window } from "vscode"

export enum Errors {
    bookUndefined,
    searchKeyEmpty,
    searchedNothing,
    chooseFaild,
    unknowError,
    bookNameEmpty,
    fetchError,
    getNovelIdFailed,
    getNovelFileFailed,
    downloadNovelFailed,
    importSearchError,
    chapterLost,
    requestError,
}

export function myerror(err: Errors): void {
    let msg: string
    switch (err) {
        case Errors.bookUndefined: {
            msg = '未找到此书籍!'
            break
        }

        case Errors.searchKeyEmpty: {
            msg = '请输入搜索关键字!'
            break
        }

        case Errors.searchedNothing: {
            msg = '未找到书籍!'
            break
        }

        case Errors.chooseFaild: {
            msg = '选择书籍时遇到错误! 请尝试重试!'
            break
        }

        case Errors.bookNameEmpty: {
            msg = '书名不能为空!'
            break
        }

        case Errors.fetchError: {
            msg = '拉取链接失败!'
            break
        }

        case Errors.requestError: {
            msg = '网络请求失败!'
            break
        }

        case Errors.getNovelIdFailed: {
            msg = '获取书籍id失败!'
            break
        }

        case Errors.getNovelFileFailed: {
            msg = '获取书籍文件失败!'
            break
        }

        case Errors.downloadNovelFailed: {
            msg = '下载小说失败!'
            break
        }

        case Errors.importSearchError: {
            msg = '导入书籍失败! 该书籍可能是您手动添加的。'
            break
        }

        case Errors.chapterLost: {
            msg = '章节获取失败!'
            break
        }

        case Errors.unknowError: default: {
            msg = '发生未知错误!'
            break
        }
    }
    window.showErrorMessage(msg)
}