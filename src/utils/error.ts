import { window } from "vscode"

export const enum Errors {
    bookUndefined,
    searchKeyEmpty,
    searchedNothing,
    chooesFaild,
    unknowError,
    bookNameEmpty,
}

export function error(err: Errors) {
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

        case Errors.chooesFaild: {
            msg = '选择书籍时遇到错误! 请尝试重试!'
            break
        }

        case Errors.bookNameEmpty: {
            msg = '书名不能为空!'
        }

        case Errors.unknowError: default: {
            msg = '发生未知错误!'
            break
        }
    }
    window.showErrorMessage(msg)
}