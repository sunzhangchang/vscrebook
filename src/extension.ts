import { existsSync, mkdirSync } from "fs"
import { ExtensionContext } from "vscode"
import { bookListInit } from "./core/bookList"
import { searchContext } from "./core/searchCtx"
import { extName, getConfig, updateConfig } from "./core/config"
import { autoFlipp, refreshAuto, showJump, showNext, showPrev, startt, toggleBossMsg } from "./core/show"
import { registerCmd, subscribeCmd } from "./utils/ext"
import { run } from './../pkg/crawl/crawl'

export function activate(context: ExtensionContext): void {
    run('123')
    console.log(`Extension "${extName}" is now active!`)

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

    let cntNext = 0
    let lstNextTime = new Date().getTime()
    // 下一页
    registerCmd('nextPage', () => {
        const now = new Date().getTime()
        if (now - lstNextTime <= 50) {
            lstNextTime = now
            ++cntNext
            if (cntNext >= 50) {
                return
            }
        } else {
            cntNext = 0
        }
        lstNextTime = now
        showNext()
        refreshAuto()
    })

    let cntPrev = 0
    let lstPrevTime = new Date().getTime()
    // 上一页
    registerCmd('prevPage', () => {
        const now = new Date().getTime()
        if (now - lstPrevTime <= 50) {
            lstPrevTime = now
            ++cntPrev
            if (cntPrev >= 50) {
                return
            }
        } else {
            cntPrev = 0
        }
        lstPrevTime = now
        showPrev()
        refreshAuto()
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
