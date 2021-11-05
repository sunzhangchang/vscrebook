import path = require("path")
import { ExtensionContext, window } from "vscode"
import { existsSync, mkdirSync, unlink } from "fs"
import { copyFileToUTF8Sync } from "../utils"
import { getBookList, updateBookList, updateBookListKV } from "../utils/operBookList"
import { ExtConfig, getWsConfig } from "../utils/operConfig"

const enum LibActions {
	choose = '选择书籍',
	add = '添加书籍',
	delete = '删除书籍'
}

export async function action(context: ExtensionContext): Promise<BookInfo | undefined> {
    let act = await window.showQuickPick([LibActions.choose, LibActions.add, LibActions.delete], {
        matchOnDescription: true
    })
    let res: BookInfo | undefined
    switch (act) {
    case LibActions.choose:
        res = await chooseBook(context)
        break

    case LibActions.add:
        res = await addBook(context)
        break

    case LibActions.delete:
        res = await deleteBook(context)
        break

    default:
        break
    }
    return res
}

async function chooseBook(context: ExtensionContext): Promise<BookInfo | undefined> {
    let book: string | undefined = await showBookList(context)
    let books = getBookList(context)
    if (book && book in books) {
        return books[book]
    }
}

async function addBook(context: ExtensionContext): Promise<BookInfo | undefined> {
    let filePath = await window.showOpenDialog()

    if (!filePath || filePath.length <= 0) {return}

    let oldPath = filePath[0].fsPath
    let newName: string | undefined = await window.showInputBox({
        value: path.basename(oldPath),
        placeHolder: '书名',
        prompt: '请输入书名(重名覆盖)'
    })

    if (!newName) {return}

    let gStoPath = context.globalStorageUri.fsPath
    let newPath = path.join(gStoPath, newName)

    if (!existsSync(gStoPath)) {mkdirSync(gStoPath)}

    let lineBreak: string | undefined = getWsConfig(ExtConfig.lineBreak)
    if (!lineBreak) {lineBreak = ' '}

    copyFileToUTF8Sync(oldPath, newPath,
        (data: string) => data.trim().replace(/[\r]+/g, '').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, lineBreak as string))

    updateBookListKV(context, newName, {
        bookPath: newPath,
        curPage: 1
    })

    window.showInformationMessage('添加成功')
    return {
        bookPath: newPath,
        curPage: 1
    }
}

async function deleteBook(context: ExtensionContext): Promise<undefined> {
    let book: string | undefined = await showBookList(context)

    if (!book) {return}

    let books = getBookList(context)
    delete books[book]
    updateBookList(context, books)

    let diskFilePath = path.join(context.globalStorageUri.fsPath, book)
    unlink(diskFilePath, () => { })
    window.showInformationMessage('删除成功')
    return
}

async function showBookList(context: ExtensionContext): Promise<string | undefined> {
    let books = getBookList(context)
    return await window.showQuickPick(Object.keys(books), {
        matchOnDescription: true
    })
}
