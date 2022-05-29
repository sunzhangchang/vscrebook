import { writeFile } from "fs/promises"
import _ = require("lodash")
import { window } from "vscode"
import { getBookList, importList } from "./bookList"

enum ImExport {
    importData = '导入书籍列表',
    exportData = '导出书籍列表',
    // importSettings = '导入设置',
    // exportSettings = '导出设置',
}

export async function imexport(): Promise<void> {
    // debug(typeof ImExport)
    const act = await window.showQuickPick(_.values(ImExport), {
        matchOnDescription: true
    })
    switch (act) {
        case ImExport.importData: {
            const res = await window.showOpenDialog({
                canSelectMany: false,
                filters: {
                    'json': ['json']
                }
            })
            if (_.isUndefined(res)) {
                return
            }
            const listPath = res[0].fsPath
            await importList(listPath)
            break
        }

        case ImExport.exportData: {
            const res = await window.showSaveDialog({
                filters: {
                    'json': ['json']
                }
            })
            if (_.isUndefined(res)) {
                return
            }
            await (
                writeFile(res.fsPath, JSON.stringify(getBookList()), {
                    encoding: 'utf8'
                }).then(() => {
                    window.showInformationMessage('导出完成!')
                })
            )
            break
        }

        // case ImExport.importSettings: {
        //     const res = await window.showOpenDialog({
        //         canSelectMany: false,
        //         filters: {
        //             'json': ['json']
        //         }
        //     })
        //     if (_.isUndefined(res)) {
        //         return
        //     }
        //     const listPath = res[0].fsPath
        //     break
        // }

        default:
            break
    }
}
