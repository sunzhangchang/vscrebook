import { existsSync, mkdirSync } from "fs"
import { commands, ExtensionContext } from "vscode"
import { bookListInit } from "./core/bookList"
import { extName, getConfig, updateConfig } from "./core/config"
import { autoFlipp, clearAutoFlipInterval, clearShowBossInterval, setShowBossInterval, showJump, showNext, showPrev, startt, toggleBossMsg } from "./core/show"

export function activate(context: ExtensionContext) {
    console.log(`Extension "${extName}" is now active!`)

    // debug(getConfig())

    if (!existsSync(context.globalStorageUri.fsPath)) {
        mkdirSync(context.globalStorageUri.fsPath)
    }

    getConfig()

    if (!existsSync(getConfig().downloadPath)) {
        mkdirSync(getConfig().downloadPath)
    }

    bookListInit(context)

    let showMenu = commands.registerCommand(`${extName}.showMenu`, () => {
        startt(context)
    })
    context.subscriptions.push(showMenu)

    // 老板键，将小说替换成 Hello, World 代码
    let bossKey = commands.registerCommand(`${extName}.bossKey`, () => {
        toggleBossMsg()
    })
    context.subscriptions.push(bossKey)

    // 下一页
    let nextPage = commands.registerCommand(`${extName}.nextPage`, () => {
        showNext()
        clearAutoFlipInterval()
        clearShowBossInterval()
        setShowBossInterval()
    })
    context.subscriptions.push(nextPage)

    // 上一页
    let prevPage = commands.registerCommand(`${extName}.prevPage`, () => {
        showPrev()
        clearAutoFlipInterval()
        clearShowBossInterval()
        setShowBossInterval()
    })
    context.subscriptions.push(prevPage)

    // 跳转
    let jumpPage = commands.registerCommand(`${extName}.jumpPage`, () => {
        showJump()
    })
    context.subscriptions.push(jumpPage)

    let autoFlip = commands.registerCommand(`${extName}.autoFlip`, () => {
        autoFlipp()
    })
    context.subscriptions.push(autoFlip)
}

export function deactivate() {
    console.log(`Extension "${extName}" is now deactive!`)
    updateConfig()
}
