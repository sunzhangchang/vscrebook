import type {
    InputBoxOptions,
    OpenDialogOptions,
    QuickPickOptions,
    SaveDialogOptions,
} from 'vscode'

export type ShowMessage = <T extends string>(message: string, ...items: T[]) => Thenable<T | undefined>

export type VscrebookWindow<Uri extends { fsPath: string }> = {
    pick: (items: string[], options?: QuickPickOptions) => Thenable<string | undefined>
    info: ShowMessage
    warn: ShowMessage
    error: ShowMessage
    input: (options?: InputBoxOptions) => Thenable<string | undefined>
    open: (options?: OpenDialogOptions) => Thenable<Uri[] | undefined>
    save: (options?: SaveDialogOptions) => Thenable<Uri | undefined>
}
