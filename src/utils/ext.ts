import { commands, Disposable, ExtensionContext } from "vscode"
import { extName } from "../core/config"

const cmds: Disposable[] = []

export function registerCmd(name: string, func: () => void): void {
    cmds.push(commands.registerCommand(`${extName}.${name}`, () => { func() }))
}

export function subscribeCmd(context: ExtensionContext): void {
    for (const iter of cmds) {
        context.subscriptions.push(iter)
    }
}
