import _ = require("lodash")
import { join, parse } from "path"
import { window } from "vscode"
import { download, search } from "../crawl"
import { copyFileToUTF8Sync, setExtTo } from "../utils"
import { updateBook } from "./bookList"
import { getConfig } from "./config"
import { error, Errors } from "../utils/error"

const enum Chooses {
    local = '本地书籍',
    online = '网络书籍',
}

async function getAdBook(): Promise<{
    bookPath: string,
    source: Source,
} | undefined> {
    let chos = await window.showQuickPick([Chooses.local, Chooses.online], {
        matchOnDescription: true
    })
    switch (chos) {
        case Chooses.local: {
            return window.showOpenDialog().then(res => {
                if (_.isUndefined(res)) {
                    return
                }
                return {
                    bookPath: res[0].fsPath,
                    source: '本地'
                }
            })
        }

        case Chooses.online: {
            let searchKey
            while (true) {
                searchKey = await window.showInputBox({
                    prompt: '请输入搜索关键字: ',
                    placeHolder: '搜索关键字',
                })
                if (_.isUndefined(searchKey)) {
                    return
                }
                if (_.isEmpty(_.trim(searchKey))) {
                    error(Errors.searchKeyEmpty)
                } else {
                    break
                }
            }

            let list = await search(searchKey)
            if (_.isNil(list)) {
                error(Errors.searchedNothing)
                return
            }
            let strlist: string[] = []
            for (const iter of list) {
                strlist.push(`${iter.书名} - 作者: ${iter.作者} - 分类: ${iter.分类} - 书源: ${iter.书源}`)
            }
            let bookName = await window.showQuickPick(strlist)

            if (_.isUndefined(bookName)) {
                return
            }

            bookName = _.split(bookName, ' - ')[0]
            let one = list.find((iter) => _.isEqual(iter.书名, bookName))
            if (_.isUndefined(one)) {
                error(Errors.chooseFaild)
                return
            }
            window.showInformationMessage(`字数: ${one.字数}  -  状态: ${one.状态}\n最新章节: ${one.最新章节}  -  最近更新: ${one.最近更新}\n${one.简介}`)
            let downloadPath = await download(one.书源, one.目录链接, getConfig().downloadPath, one.书名)

            return {
                bookPath: downloadPath,
                source: one.书源,
            }
        }
    }
}

export async function addBook(gStoPath: string, bookPath?: string, bookInfo?: BookInfo) {
    // debug('Done here!')
    let oldPath: string | undefined
    let source: Source | undefined
    let curPage: number | undefined
    let pageSize: number | undefined

    if (!_.isUndefined(bookInfo)) {
        source = bookInfo.source
        curPage = bookInfo.curPage
        pageSize = bookInfo.pageSize
    }
    if (_.isUndefined(bookPath)) {
        let tmp = await getAdBook()
        if (!_.isUndefined(tmp)) {
            source = tmp.source ?? source
            oldPath = tmp.bookPath ?? oldPath
        }
    } else {
        oldPath = oldPath ?? bookPath
    }

    if (_.isUndefined(source)) {
        source = '本地'
    }
    if (_.isUndefined(oldPath)) {
        return
    }

    let bookName = parse(oldPath).name
    let newPath = join(gStoPath, setExtTo(bookName, 'txt'))

    copyFileToUTF8Sync(oldPath, newPath,
        (data: string) => _(data)
            .chain()
            .trim()
            .replace(/[\r]+/g, '')
            .replace(/[\t　 ]+/g, ' ')
            .replace(/[\n]+/g, ' ')
            .value()
    )

    const newBook: BookInfo = {
        bookName,
        pageSize: pageSize ?? getConfig().pageSize,
        curPage: curPage ?? 1,
        source,
    }

    updateBook(bookName, newBook)

    window.showInformationMessage('添加成功')
    return newBook
}
