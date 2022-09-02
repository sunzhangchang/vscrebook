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

export function activate(extContext: ExtensionContext) {
    const config = new ConfigBase<WorkspaceConfiguration>(workspace.getConfiguration)

    const statusBar = window.createStatusBarItem()

    function showText(msg: string): void {
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

    const codes: string[] = [
        'Java - System.out.println("Hello World");',
        'Scala - println("Hello, world!")',
        'Kotlin - println("Hello, world!")',
        'Groovy - println "Hello, world!"',
        'C - printf("Hello, World!");',
        'C# - System.Console.WriteLine("Hello World!"); ',
        'C++ - cout << "Hello, world!" << endl;',
        'Python - print("Hello, World!")',
        'PHP - echo "Hello World!";',
        'Ruby - puts "Hello World!";',
        'Rust - println!("Hello, World!");',
        'Perl - print "Hello, World!";',
        'Lua - print("Hello World!")',
        'Golang - fmt.Println("Hello, World!")',
        'JavaScript - console.log("Hello, World!")',
        'TypeScript - console.log("Hello, World!")',
        'ReScript - Js.log("Hello, World!")',
        'PureScript - log "Hello, World!"',
        'Scala.js - println("Hello, World!")',
    ]

    function showBoss(): void {
        switch (config.displayMode) {
            case 'statusBar': default: {
                const index: number = Math.floor(Math.random() * codes.length)
                showText(codes[index])
                break
            }

            case 'showInformation': {
                commands.executeCommand('notifications.hideToasts')
                break
            }
        }
    }

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
