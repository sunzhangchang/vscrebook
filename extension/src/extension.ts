import { Context, Core } from "@vscrebook/core"
import { ConfigBase } from "@vscrebook/config"
import { Uri, window, WorkspaceConfiguration, ExtensionContext, workspace, commands } from "vscode"
import { Errors, myerror } from "@vscrebook/utils"
import { Showing } from "@vscrebook/core/src/showing"
import { Command } from "./command"

class Config extends ConfigBase<WorkspaceConfiguration> { }

const cmd = new Command()

function showError(err: Errors | string) {
    window.showErrorMessage(myerror(err))
}

const statusBar = window.createStatusBarItem()

async function showText(config: Config, msg: string): Promise<void> {
    switch (config.displayMode) {
        case 'statusBar': default: {
            statusBar.show()
            statusBar.text = msg
            break
        }

        case 'showInformation': {
            statusBar.hide()
            window.showInformationMessage(msg)
            break
        }
    }
}

async function showBoss(config: Config): Promise<void> {
    switch (config.displayMode) {
        case 'statusBar': default: {
            const index: number = Math.floor(Math.random() * config.bossTexts.length)
            await showText(config, config.bossTexts[index])
            break
        }

        case 'showInformation': {
            commands.executeCommand('notifications.hideToasts')
            break
        }
    }
}

async function tryActivate(extContext: ExtensionContext): Promise<void> {
    return ((async () => {
        const config = new Config(workspace.getConfiguration, showError)

        const context = new Context(
            extContext.globalStorageUri.fsPath,
            extContext.globalState,
            showError
        )

        const showing = new Showing(
            (msg: string) => showText(config, msg),
            () => showBoss(config),
        )

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
            showing,
            config,
            context
        )

        return Promise.all([
            cmd.register('showMenu', () => {
                core.start()
            }),

            cmd.register('bossKey', () => {
                core.toggleBoss()
            }),

            ((async () => {
                let cntNext = 0
                let lstNextTime = new Date().getTime()
                // 下一页
                cmd.register('nextPage', () => {
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
                    core.showing.refreshAuto()
                })
            })()),

            ((async () => {
                let cntPrev = 0
                let lstPrevTime = new Date().getTime()
                // 上一页
                cmd.register('prevPage', () => {
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
                    core.showing.refreshAuto()
                })
            })()),

            // 跳转
            cmd.register('jumpPage', () => {
                core.showJump()
            }),

            // 自动翻页
            cmd.register('autoFlip', () => {
                core.autoFlipp()
            }),

            // 搜索内容
            cmd.register('search', () => {
                core.searchContext()
            }),
        ])

    })()).then(() => {
        cmd.subscribe(extContext)
    })
}

export async function activate(extContext: ExtensionContext) {
    return tryActivate(extContext).catch((err) => {
        window.showErrorMessage(`Cannot activate vscrebook: ${(err as Error).message}`)
        throw err
    })
}

export function deactivate(): void {
    console.log(`Extension vscrebook is deactive.`)
    cmd.disposeAll()
}
