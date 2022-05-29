import { existsSync, mkdirSync } from "fs"
import { ExtensionContext } from "vscode"
import { bookListInit } from "./core/bookList"
import { searchContext } from "./core/searchCtx"
import { extName, getConfig, updateConfig } from "./core/config"
import { autoFlipp, clearAutoFlipInterval, clearShowBossInterval, setShowBossInterval, showJump, showNext, showPrev, startt, toggleBossMsg } from "./core/show"
import { registerCmd, subscribeCmd } from "./utils/ext"

export function activate(context: ExtensionContext): void {
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

    registerCmd('showMenu', () => {
        startt(context)
    })

    // 老板键，将小说替换成 Hello, World 代码
    registerCmd('bossKey', () => {
        toggleBossMsg()
    })

    // 下一页
    registerCmd('nextPage', () => {
        showNext()
        clearAutoFlipInterval()
        clearShowBossInterval()
        setShowBossInterval()
    })

    // 上一页
    registerCmd('prevPage', () => {
        showPrev()
        clearAutoFlipInterval()
        clearShowBossInterval()
        setShowBossInterval()
    })

    // 跳转
    registerCmd('jumpPage', () => {
        showJump()
    })

    // 自动翻页
    registerCmd('autoFlip', () => {
        autoFlipp()
    })

    // 搜索内容
    registerCmd('search', () => {
        searchContext()
    })

    subscribeCmd(context)
}

export function deactivate(): void {
    console.log(`Extension "${extName}" is now deactive!`)
    updateConfig()
}
