import { writeFileSync } from "fs"
import _ = require("lodash")
import { window } from "vscode"
import { getBookList, importList } from "../utils/bookList"
import { debug } from "../utils/debug"

enum ImExport {
    importData = '导入书籍列表',
    exportData = '导出书籍列表',
}

export async function imexport() {
    // debug(typeof ImExport)
    let act = await window.showQuickPick(_.values(ImExport), {
        matchOnDescription: true
    })
    switch (act) {
        case ImExport.importData: {
            let res = await window.showOpenDialog({ canSelectMany: false })
            if (_.isUndefined(res)) {
                return
            }
            let listPath = res[0].fsPath
            await importList(listPath)
            break
        }

        case ImExport.exportData: {
            let res = await window.showSaveDialog()
            if (_.isUndefined(res)) {
                return
            }
            writeFileSync(res.fsPath, JSON.stringify(getBookList()), {
                encoding: 'utf8'
            })
            break
        }

        default:
            break
    }
}
