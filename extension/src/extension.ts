import { Context, Core } from "@vscrebook/core"
import { ConfigBase } from "@vscrebook/config"
import { Uri, window, WorkspaceConfiguration, ExtensionContext, workspace, Disposable, commands } from "vscode"

const extName = 'vscrebook'

const cmds: Disposable[] = []

function registerCmd(name: string, func: () => void): void {
    cmds.push(commands.registerCommand(`${extName}.${name}`, () => { func() }))
}

function subscribeCmd(context: ExtensionContext): void {
    for (const iter of cmds) {
        context.subscriptions.push(iter)
    }
}

function showText(msg: string): void {
    window.setStatusBarMessage(msg)
}

function showBoss(): void {
    window.setStatusBarMessage('')
}

export function activate(extContext: ExtensionContext) {
    const config = new ConfigBase<WorkspaceConfiguration>(extContext.globalStorageUri.fsPath, workspace.getConfiguration)

    const context = new Context(extContext.globalStorageUri.fsPath, extContext.globalState)

    const core = new Core<Uri, WorkspaceConfiguration>(
        {
            pick: window.showQuickPick,
            info: window.showInformationMessage,
            warn: window.showWarningMessage,
            error: window.showErrorMessage,
            input: window.showInputBox,
            open: window.showOpenDialog,
            save: window.showSaveDialog
        },
        showText,
        showBoss,
        config,
        context
    )

    registerCmd('showMenu', () => {
        core.start()
    })

    registerCmd('bossKey', () => {
        core.toggleBoss()
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
        core.showNext()
        core.refreshAuto()
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
        core.showPrev()
        core.refreshAuto()
    })

    // 跳转
    registerCmd('jumpPage', () => {
        core.showJump()
    })

    // 自动翻页
    registerCmd('autoFlip', () => {
        core.autoFlipp()
    })

    // 搜索内容
    registerCmd('search', () => {
        core.searchContext()
    })

    subscribeCmd(extContext)
}

export function deactivate(): void {
    console.log(`Extension ${extName} is deactive.`)
}
