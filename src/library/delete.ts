import { unlink } from "fs/promises"
import _ = require("lodash")
import { join } from "path"
import { window } from "vscode"
import { setExtTo } from "../utils"
import { delBookFromList } from "../utils/bookList"
import { showBossText } from "../utils/showing"
import { showBookList } from "./utils"

export async function deleteBook(gStoPath: string): Promise<undefined> {
    let book: string | undefined = await showBookList()

    if (_.isUndefined(book)) {
        return
    }

    delBookFromList(book)

    let diskFilePath = join(gStoPath, setExtTo(book, 'txt'))
    await unlink(diskFilePath)
    window.showInformationMessage('删除成功')
    showBossText()
    return
}
