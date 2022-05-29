import { selectBook } from "./select"
import { addBook } from "./add"
import { deleteBook } from "./delete"
import { ExtensionContext, window } from "vscode"
import { imexport } from "./imexport"
import _ = require("lodash")
import { settings } from "./settings"

enum LibActions {
    select = '选择书籍',
    add = '添加书籍',
    delete = '删除书籍',
    imexport = '导入/导出 书籍列表',
    settings = '设置',
}

export async function showMainMenu(context: ExtensionContext): Promise<BookInfo | undefined> {
    const act = await window.showQuickPick(_.values(LibActions), {
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

        case LibActions.imexport: {
            await imexport()
            res = undefined
            break
        }

        case LibActions.settings: {
            await settings()
            res = undefined
            break
        }

        default: {
            res = undefined
            break
        }
    }
    return res
}
