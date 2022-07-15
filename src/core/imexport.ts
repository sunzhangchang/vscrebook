import { writeFile } from "fs/promises"
import _ from "lodash"
import { window } from "vscode"
import { readFileToUTF8Sync } from "../utils"
import { getBookList, importList } from "./bookList"
import { getConfig, setConfig } from "./config"

enum ImExport {
    importData = '导入书籍列表',
    exportData = '导出书籍列表',
    importSettings = '导入设置',
    exportSettings = '导出设置',
}

export async function imexport(): Promise<void> {
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
                    window.showInformationMessage('导出书籍列表成功!')
                })
            )
            break
        }

        case ImExport.importSettings: {
            const res = await window.showOpenDialog({
                canSelectMany: false,
                filters: {
                    'json': ['json']
                }
            })
            if (_.isUndefined(res)) {
                return
            }
            const path = res[0].fsPath
            const settings = readFileToUTF8Sync(path)
            _.forIn(settings, (v, k) => {
                setConfig(k, v)
            })
            break
        }

        case ImExport.exportSettings: {
            const res = await window.showSaveDialog({
                filters: {
                    'json': ['json']
                }
            })
            if (_.isUndefined(res)) {
                return
            }
            const path = res.fsPath
            await (
                writeFile(path, JSON.stringify(getConfig()), 'utf-8')
                    .then(() => {
                        window.showInformationMessage('导出设置成功!')
                    })
            )
            break
        }

        default:
            break
    }
}
