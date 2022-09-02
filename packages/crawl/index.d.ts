export * from './pkg/crawl.d'

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

declare type ThreadNum = number

// declare type ConfigType = ConfigBase<number, string, number, DisplayMode, ShowMoreInfo, DownloadSettings, ThreadNum>

declare function get_config(): {
    showMoreInfo: ShowMoreInfo
    threadNum: ThreadNum
    downloadSettings: DownloadSettings
}

export let config: () => {
    get showMoreInfo(): ShowMoreInfo
    set showMoreInfo(v: ShowMoreInfo)
    get threadNum(): ThreadNum
    set threadNum(v: ThreadNum)
    get downloadSettings(): DownloadSettings
    set downloadSettings(v: DownloadSettings)
}
