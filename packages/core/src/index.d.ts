declare type DisplayMode =
    | 'statusBar'
    | 'showInformation'

declare type SourceEng =
    | 'caimoge'
    | 'wbxsw'
    | 'aixiashu'
    | 'maxreader'

declare type ShowMoreInfo = Record<SourceEng, boolean>

declare type DownloadSettings = Record<SourceEng, 'disable' | 'txtOnly' | 'chaptersOnly' | 'txt & chapters'>

declare type BossTexts = string[]

declare type ThreadNum = number

// declare type ConfigType = ConfigBase<number, string, number, DisplayMode, ShowMoreInfo, DownloadSettings, ThreadNum>

declare function get_config(): {
    showMoreInfo: ShowMoreInfo
    threadNum: ThreadNum
    downloadSettings: DownloadSettings
}

declare type Source =
    | '本地'
    | '采墨阁'
    | '58小说网'
    | '爱下书小说网'
    | '醉读'

declare type BookInfo = {
    bookName: string
    pageSize: number
    curPage: number
    source: Source
}

declare type SearchBook = {
    书名: string
    作者: string
    状态: string
    分类: string
    字数: string
    简介: string
    最新章节: string
    最近更新: string
    目录链接: string
    书源: Source
}

declare type searchCtxResult = {
    index: number
    page: number
    txt: string
}

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
type Input = (options?: InputBoxOptions) => Thenable<string | undefined>
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
