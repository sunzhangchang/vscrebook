import { unlink } from "fs/promises"
import _ from "lodash"
import { join } from "path"
import { window } from "vscode"
import { setExtTo } from "../utils"
import { delBookFromList } from "./bookList"
import { showBossText } from "./show"
import { showBookList } from "./utils"

export async function deleteBook(gStoPath: string): Promise<undefined> {
    const book: string | undefined = await showBookList()

    if (_.isUndefined(book)) {
        return
    }

    delBookFromList(book)

    const diskFilePath = join(gStoPath, setExtTo(book, 'txt'))
    await unlink(diskFilePath)
    window.showInformationMessage('删除成功')
    showBossText()
    return
}
