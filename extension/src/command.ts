import { commands, Disposable, ExtensionContext } from "vscode"

const extName = 'vscrebook'

export class Command {
    private cmds: Disposable[] = []

    constructor() {
    }

    register(name: string, func: () => void): void {
        this.cmds.push(commands.registerCommand(`${extName}.${name}`, () => { func() }))
    }

    subscribe(context: ExtensionContext): void {
        for (const iter of this.cmds) {
            context.subscriptions.push(iter)
        }
    }

    disposeAll(): void {
        for (const iter of this.cmds) {
            iter.dispose()
        }
    }
}