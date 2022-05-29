import _ = require("lodash")
import { window } from "vscode"
import { getBookList } from "./bookList"
import { error, Errors } from "../utils/error"

export async function showBookList(): Promise<string | undefined> {
    const books = getBookList()
    return await window.showQuickPick(Object.keys(books), {
        matchOnDescription: true
    })
}

export async function changeName(oldName: string): Promise<string | undefined> {
    let newName: string | undefined = oldName
    const true_ = true
    while (true_) {
        newName = await window.showInputBox({
            value: oldName,
            placeHolder: '书名',
            prompt: '请输入书名(重名覆盖)'
        })

        if (!_.isUndefined(newName)) {
            break
        }

        error(Errors.bookNameEmpty)

        const cs = await window.showInformationMessage('是否重新输入书名?', '是', '否')
        if (_.isUndefined(cs) || _.isEqual(cs, '否')) {
            newName = oldName
            break
        }
    }
    return newName
}
