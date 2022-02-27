import { mkdirSync, statSync } from "fs"
import { commands, ExtensionContext } from "vscode"
import { bookListInit } from "./utils/bookList"
import { extName } from "./utils/config"
import { autoFlipp, clearAutoFlipInterval, clearShowBossInterval, setShowBossInterval, showJump, showNext, showPrev, startt, toggleBossMsg } from "./utils/showing"

export function activate(context: ExtensionContext) {
    console.log(`Congratulations, your extension "${extName}" is now active!`)

    if (!statSync(context.globalStorageUri.fsPath)) {
        mkdirSync(context.globalStorageUri.fsPath)
    }

    if (!statSync('D:/Downloads/')) {
        mkdirSync('D:/Downloads/')
    }

    bookListInit(context)

    let start = commands.registerCommand(`${extName}.start`, () => {
        startt(context)
    })
    context.subscriptions.push(start)

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

export function deactivate() { }
