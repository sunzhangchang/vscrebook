import { commands, Disposable, ExtensionContext } from "vscode"

const extName = 'vscrebook'

export class Command {
    private cmds: Disposable[] = []

    async register(name: string, func: () => void): Promise<void> {
        this.cmds.push(commands.registerCommand(`${extName}.${name}`, () => { func() }))
    }

    async subscribe(context: ExtensionContext): Promise<void> {
        for (const iter of this.cmds) {
            context.subscriptions.push(iter)
        }
    }

    async disposeAll(): Promise<void> {
        for (const iter of this.cmds) {
            iter.dispose()
        }
    }
}