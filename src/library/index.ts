import { selectBook } from "./select"
import { addBook } from "./add"
import { deleteBook } from "./delete"
import { ExtensionContext, window } from "vscode"

const enum LibActions {
    select = '选择书籍',
    add = '添加书籍',
    delete = '删除书籍',
}

export async function showMainMenu(context: ExtensionContext): Promise<BookInfo | undefined> {
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
