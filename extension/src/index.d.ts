
interface PickOptions {
    canPickMany?: boolean
    matchOnDescription?: boolean
    matchOnDetail?: boolean
}

interface InputBoxOptions {
    title?: string;
    value?: string;
    valueSelection?: [number, number];
    prompt?: string;
    placeHolder?: string;
}

interface OpenDialogOptions<Uri> {
    defaultUri?: Uri;
    openLabel?: string;
    canSelectFiles?: boolean;
    canSelectFolders?: boolean;
    canSelectMany?: boolean;
    filters?: { [name: string]: string[] };
    title?: string;
}

interface SaveDialogOptions<Uri> {
    defaultUri?: Uri;
    saveLabel?: string;
    filters?: { [name: string]: string[] };
    title?: string;
}

type QuickPick = (s: string[], opt?: PickOptions) => Thenable<string | undefined>
type ShowMsg = <T extends string>(s: string, ...items: T[]) => Thenable<T | undefined>
type Input = (options?: InputBoxOptions | undefined) => Thenable<string | undefined>
type OpenDialog<Uri extends { fsPath: string }> = (options?: OpenDialogOptions<Uri>) => Thenable<Uri[] | undefined>
type SaveDialog<Uri extends { fsPath: string }> = (options?: SaveDialogOptions<Uri>) => Thenable<Uri | undefined>

type ShowText = (msg: string) => void

type Window<Uri extends { fsPath: string }> = {
    pick: QuickPick
    info: ShowMsg
    warn: ShowMsg
    error: ShowMsg
    input: Input
    open: OpenDialog<Uri>
    save: SaveDialog<Uri>
}
