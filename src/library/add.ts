import { mkdir, stat } from "fs/promises"
import _ = require("lodash")
import { basename, join } from "path"
import { window } from "vscode"
import { SearchBook } from "../../pkg/crawl"
import { copyFileToUTF8 } from "../utils"
import { getBookList, updateBook } from "../utils/bookList"
import { Default, ExtConfig, getWsConfig, updateWsConfig } from "../utils/config"
import { download, search } from "../utils/crawl"
import { error, Errors } from "../utils/error"
import { changeName } from "./utils"

const enum Chooses {
    local = '本地书籍',
    online = '网络书籍',
}

async function getAdBook() {
    let chos = await window.showQuickPick([Chooses.local, Chooses.online], {
        matchOnDescription: true
    })
    let bookPath: string | undefined
    switch (chos) {
        case Chooses.local: {
            let tmp = await window.showOpenDialog()
            if (_.isUndefined(tmp)) {
                return
            }
            bookPath = tmp[0].fsPath
            break
        }

        case Chooses.online: {
            let searchKey
            while (true) {
                searchKey = await window.showInputBox({
                    prompt: '请输入搜索关键字: ',
                    placeHolder: '搜索关键字',
                })
                if (_.isUndefined(searchKey)) {
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
                strlist.push(`${iter.书名} - 作者: ${iter.作者} - 分类: ${iter.分类}`)
            }
            let bookName = await window.showQuickPick(strlist)
            if (_.isUndefined(bookName)) {
                return
            }
            let one: SearchBook | undefined
            bookName = bookName.split(' - ')[0]
            for (const iter of list) {
                if (_.isEqual(bookName, iter.书名)) {
                    one = iter
                    break
                }
                one = undefined
            }
            if (_.isUndefined(one)) {
                error(Errors.chooesFaild)
                return
            }
            if (!_.endsWith(one.书名, '.txt')) {
                one.书名 += '.txt'
            }
            window.showInformationMessage(`字数: ${one.字数}  -  状态: ${one.状态}\n最新章节: ${one.最新章节}  -  最近更新: ${one.最近更新}\n${one.简介}`)
            await download(one.目录链接, one.书名)
            if (_.isUndefined(getWsConfig(ExtConfig.downloadPath))) {
                updateWsConfig(ExtConfig.downloadPath, Default.downloadPath, true)
            }
            bookPath = join(getWsConfig(ExtConfig.downloadPath) as string, one.书名)
            if (await stat(one.书名)) {
                break
            }
        }
    }
    return bookPath
}

export async function addBook(gStoPath: string): Promise<BookInfo | undefined> {
    let oldPath = await getAdBook()

    if (_.isUndefined(oldPath)) {
        return
    }

    let newName: string
    let _oldName = basename(oldPath)

    if (_.includes(getBookList(), _oldName)) {
        let tmp = await changeName(_oldName)
        if (_.isUndefined(tmp)) {
            tmp = _oldName
        }
        newName = tmp
    } else {
        newName = _oldName
    }

    if (!_.endsWith(newName, '.txt')) {
        newName += '.txt'
    }

    let newPath = join(gStoPath, newName)

    if (!await stat(gStoPath)) {
        await mkdir(gStoPath)
    }

    let lineBreak: string | undefined = getWsConfig(ExtConfig.lineBreak)
    if (_.isUndefined(lineBreak)) { lineBreak = ' ' }

    await copyFileToUTF8(oldPath, newPath,
        (data: string) => data.trim().replace(/[\r]+/g, '').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, lineBreak as string))

    updateBook(newName, {
        bookPath: newPath,
        curPage: 1
    })

    window.showInformationMessage('添加成功')
    return {
        bookPath: newPath,
        curPage: 1
    }
}
