import { accessSync, constants, mkdirSync } from "fs"
import _ = require("lodash")
import { basename, join } from "path"
import { window } from "vscode"
import { SearchBook } from "../../pkg/crawl"
import { copyFileToUTF8Sync } from "../utils"
import { getBookList, updateBook } from "../utils/bookList"
import { getConfig } from "../utils/config"
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
    switch (chos) {
        case Chooses.local: {
            return window.showOpenDialog().then(res => {
                if (_.isUndefined(res)) {
                    return
                }
                return res[0].fsPath
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
                if (_.isEmpty(searchKey.trim())) {
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
            let res = await window.showQuickPick(strlist)
            if (_.isUndefined(res)) {
                return
            }

            let bookName = res.slice()

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
            return download(one.目录链接, one.书名).then(() => {
                window.showInformationMessage('ok?')
                let tmp: string = ''
                let t = setTimeout(() => {
                    if (_.isUndefined(one)) {
                        error(Errors.chooesFaild)
                        return
                    }
                    tmp = join(getConfig().downloadPath, one.书名)
                    clearTimeout(t)
                    console.log(t)
                }, 500)
                while (t.hasRef()) {
                }
                console.log(tmp)
                return tmp
            })
        }
    }
}

export async function addBook(gStoPath: string): Promise<BookInfo | undefined> {
    return await (getAdBook().then(oldPath => {
        if (_.isUndefined(oldPath)) {
            return
        }

        try {
            accessSync(gStoPath, constants.F_OK)
        } catch (err) {
            mkdirSync(gStoPath)
        }

        let _oldName = basename(oldPath)
        let newName: string = _oldName

        if (_.includes(getBookList(), _oldName)) {
            changeName(_oldName).then(res => {
                if (_.isUndefined(res)) {
                    newName = _oldName
                } else {
                    newName = res
                }
            })
        } else {
            newName = _oldName
        }

        if (!_.endsWith(newName, '.txt')) {
            newName += '.txt'
        }

        let newPath = join(gStoPath, newName)

        try {
            accessSync(gStoPath, constants.F_OK)
        } catch (err) {
            mkdirSync(gStoPath)
        }

        console.log(newPath)

        copyFileToUTF8Sync(oldPath, newPath,
            (data: string) => data.trim().replace(/[\r]+/g, '').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, ' '))

        const newBook: BookInfo = {
            bookName: newName,
            pageSize: getConfig().pageSize,
            curPage: 1
        }

        updateBook(newName, newBook)

        window.showInformationMessage('添加成功')
        return newBook
    }))
}
