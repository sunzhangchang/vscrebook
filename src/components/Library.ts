import { ExtensionContext, window } from "vscode"
import { unlink } from "fs"
import { copyFileToUTF8 } from "../utils"
import { getBookList, updateBook, updateBookList } from "../utils/bookList"
import { defaultDownloadPath, ExtConfig, getWsConfig, updateWsConfig } from "../utils/config"
import { showBossText } from "../utils/statusBar"
import { download, search } from "../utils/crawl"
import { error, Errors } from "../utils/error"
import _ = require("lodash")
import { SearchBook } from "../../pkg/crawl"
import { basename, join } from "path"
import { mkdir, stat } from "fs/promises"

const enum LibActions {
    select = '选择书籍',
    add = '添加书籍',
    delete = '删除书籍',
}

export async function action(context: ExtensionContext): Promise<BookInfo | undefined> {
    let act = await window.showQuickPick([LibActions.select, LibActions.add, LibActions.delete], {
        matchOnDescription: true
    })
    let res: BookInfo | undefined
    switch (act) {
        case LibActions.select: {
            res = await selectBook()
            break
        }

        case LibActions.add: {
            res = await addBook(context.globalStorageUri.fsPath)
            break
        }

        case LibActions.delete: {
            res = await deleteBook(context.globalStorageUri.fsPath)
            break
        }

        default: {
            break
        }
    }
    return res
}

async function selectBook(): Promise<BookInfo | undefined> {
    let book: string | undefined = await showBookList()
    let books = getBookList()
    if (book && book in books) {
        return books[book]
    }
}

async function changeName(oldName: string): Promise<string | undefined> {
    let newName: string | undefined = oldName
    while (true) {
        newName = await window.showInputBox({
            value: oldName,
            placeHolder: '书名',
            prompt: '请输入书名(重名覆盖)'
        })

        if (!_.isUndefined(newName)) {
            break
        }

        error(Errors.bookNameEmpty)

        let cs = await window.showInformationMessage('是否重新输入书名?', '是', '否')
        if (_.isUndefined(cs) || _.isEqual(cs, '否')) {
            newName = oldName
            break
        }
    }
    return newName
}

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
                updateWsConfig(ExtConfig.downloadPath, defaultDownloadPath, true)
            }
            bookPath = join(getWsConfig(ExtConfig.downloadPath) as string, one.书名)
            if (await stat(one.书名)) {
                break
            }
        }
    }
    return bookPath
}

async function addBook(gStoPath: string): Promise<BookInfo | undefined> {
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

async function deleteBook(gStoPath: string): Promise<undefined> {
    let book: string | undefined = await showBookList()

    if (_.isUndefined(book)) { return }

    let books = getBookList()
    delete books[book]
    updateBookList(books)

    let diskFilePath = join(gStoPath, book)
    unlink(diskFilePath, () => { })
    window.showInformationMessage('删除成功')
    showBossText()
    return
}

async function showBookList(): Promise<string | undefined> {
    let books = getBookList()
    return await window.showQuickPick(Object.keys(books), {
        matchOnDescription: true
    })
}
